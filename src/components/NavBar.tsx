"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">☕</span>
          <span
            className="font-bold text-lg text-brand-orange"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Smart Caffeine Quiz
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-text-secondary hover:text-neon-yellow transition text-sm"
          >
            🏆 Leaderboard
          </Link>
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-bg-card border border-white/10 flex items-center justify-center text-text-secondary hover:border-brand-orange/50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
