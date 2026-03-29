import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");

  if (!topic) {
    return NextResponse.json({ error: "topic parameter is required" }, { status: 400 });
  }

  const weekNumber = getWeekNumber();

  // Fetch questions that are active AND either have no week restriction or match current week
  const { data: questions, error } = await supabase
    .from("quiz_questions")
    .select("id, topic, question, options")  // NOTE: correct_index is NOT selected
    .eq("topic", topic)
    .eq("active", true)
    .eq("week_number", weekNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No questions found for this topic" }, { status: 404 });
  }

  // Shuffle and take 10
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 10);

  return NextResponse.json({
    weekNumber,
    topic,
    questions: shuffled,
  });
}
