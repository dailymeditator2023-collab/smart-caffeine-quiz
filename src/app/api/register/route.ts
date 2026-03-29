import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  let { name, email, phone } = body;

  // Normalize
  name = (name || "").trim();
  email = (email || "").trim().toLowerCase();
  phone = (phone || "").trim();

  // Validate
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const phoneDigits = phone.replace(/\D/g, "").slice(-10);
  if (phoneDigits.length !== 10) {
    return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id, name, email, streak")
    .eq("email", email)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Email already registered", user: existing },
      { status: 409 }
    );
  }

  // Insert new user
  const { data: user, error } = await supabase
    .from("users")
    .insert({ name, email, phone })
    .select("id, name, email, streak, last_played_week")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user });
}
