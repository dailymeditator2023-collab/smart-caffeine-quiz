import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";
import { calculateBadges } from "@/lib/badges";
import type { AnswerBreakdown } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { email, topic, answers, time_seconds } = body;

  // Validate required fields
  if (!email || !topic || !answers || time_seconds == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Array.isArray(answers) || answers.length !== 10) {
    return NextResponse.json({ error: "Must submit exactly 10 answers" }, { status: 400 });
  }

  // Anti-cheat: reject suspiciously fast submissions
  if (time_seconds < 5) {
    return NextResponse.json({ error: "Submission too fast" }, { status: 400 });
  }

  const weekNumber = getWeekNumber();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verify user exists
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, streak, last_played_week")
    .eq("email", normalizedEmail)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 });
  }

  // 2. Check for existing attempt this week for this topic
  const { data: existing } = await supabase
    .from("attempts")
    .select("id")
    .eq("email", normalizedEmail)
    .eq("topic", topic)
    .eq("week_number", weekNumber)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Already attempted this topic this week" },
      { status: 409 }
    );
  }

  // 3. Fetch correct answers from DB
  // answers is an array of {question_id, selected} objects
  const questionIds = answers.map((a: { question_id: string }) => a.question_id);
  const { data: correctQuestions, error: qError } = await supabase
    .from("quiz_questions")
    .select("id, correct_index")
    .in("id", questionIds);

  if (qError || !correctQuestions || correctQuestions.length !== 10) {
    return NextResponse.json({ error: "Failed to validate answers" }, { status: 500 });
  }

  // Build a lookup map
  const correctMap = new Map(correctQuestions.map((q) => [q.id, q.correct_index]));

  // 4. Score the quiz
  let score = 0;
  const answersBreakdown: AnswerBreakdown[] = answers.map(
    (a: { question_id: string; selected: number }) => {
      const correctIndex = correctMap.get(a.question_id) ?? -1;
      const isCorrect = a.selected === correctIndex;
      if (isCorrect) score++;
      return {
        question_id: a.question_id,
        selected: a.selected,
        correct_index: correctIndex,
        is_correct: isCorrect,
      };
    }
  );

  // 5. Get previous best score for this topic (for Personal Best badge)
  const { data: prevAttempts } = await supabase
    .from("attempts")
    .select("score")
    .eq("email", normalizedEmail)
    .eq("topic", topic)
    .order("score", { ascending: false })
    .limit(1);

  const previousBest = prevAttempts && prevAttempts.length > 0 ? prevAttempts[0].score : null;

  // 6. Calculate streak
  let newStreak = user.streak;
  if (user.last_played_week === weekNumber) {
    // Already played this week, streak stays the same
  } else if (user.last_played_week === weekNumber - 1) {
    // Consecutive week — increment streak
    newStreak = user.streak + 1;
  } else {
    // Gap — reset streak to 1
    newStreak = 1;
  }

  // 7. Calculate badges
  const badges = calculateBadges({
    score,
    timeSeconds: time_seconds,
    streak: newStreak,
    previousBest,
  });

  // 8. Insert attempt
  const { error: insertError } = await supabase.from("attempts").insert({
    user_id: user.id,
    email: normalizedEmail,
    topic,
    week_number: weekNumber,
    score,
    time_seconds,
    badges,
    answers_breakdown: answersBreakdown,
  });

  if (insertError) {
    // Could be a unique constraint violation (race condition)
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Already attempted this topic this week" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 9. Update user streak + last_played_week
  if (user.last_played_week !== weekNumber) {
    await supabase
      .from("users")
      .update({ streak: newStreak, last_played_week: weekNumber })
      .eq("id", user.id);
  }

  // 10. Get user's rank for this topic this week
  const { data: rankData } = await supabase
    .from("attempts")
    .select("email")
    .eq("topic", topic)
    .eq("week_number", weekNumber)
    .or(`score.gt.${score},and(score.eq.${score},time_seconds.lt.${time_seconds})`)

  const rank = (rankData?.length ?? 0) + 1;

  return NextResponse.json({
    score,
    time_seconds,
    badges,
    answers_breakdown: answersBreakdown,
    rank,
    weekNumber,
    streak: newStreak,
  });
}
