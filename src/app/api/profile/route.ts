import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getWeekNumber } from "@/lib/week";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "email parameter is required" }, { status: 400 });
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get all attempts
  const { data: attempts } = await supabase
    .from("attempts")
    .select("topic, week_number, score, time_seconds, badges, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false });

  const weekNumber = getWeekNumber();

  // Topics played this week
  const topicsPlayedThisWeek = (attempts || [])
    .filter((a) => a.week_number === weekNumber)
    .map((a) => a.topic);

  // Best scores per topic (across all weeks)
  const bestScores: Record<string, { score: number; time_seconds: number; week_number: number }> = {};
  for (const a of attempts || []) {
    const existing = bestScores[a.topic];
    if (!existing || a.score > existing.score || (a.score === existing.score && a.time_seconds < existing.time_seconds)) {
      bestScores[a.topic] = {
        score: a.score,
        time_seconds: a.time_seconds,
        week_number: a.week_number,
      };
    }
  }

  // Count unique weeks played
  const uniqueWeeks = new Set((attempts || []).map((a) => a.week_number));

  return NextResponse.json({
    user,
    attempts: attempts || [],
    topics_played_this_week: topicsPlayedThisWeek,
    best_scores: bestScores,
    total_weeks_played: uniqueWeeks.size,
    current_week: weekNumber,
  });
}
