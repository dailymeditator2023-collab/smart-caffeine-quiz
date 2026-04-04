import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "unknown";
  const campaign = searchParams.get("campaign") || "unknown";
  const email = searchParams.get("email") || null;

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Log the click (fire-and-forget)
  const supabase = getSupabase();
  supabase
    .from("email_clicks")
    .insert({ email, link_type: type, campaign, url })
    .then(() => {}, (err) => console.error("Click tracking failed:", err));

  // Redirect to destination
  return NextResponse.redirect(url, 302);
}
