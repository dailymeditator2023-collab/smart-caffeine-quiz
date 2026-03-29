"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import BadgeDisplay from "@/components/BadgeDisplay";
import ShareCard from "@/components/ShareCard";
import { formatTime } from "@/lib/week";
import { getShareText } from "@/lib/share";
import type { AnswerBreakdown, ClientQuestion } from "@/lib/types";

interface QuizResult {
  score: number;
  time_seconds: number;
  badges: string[];
  answers_breakdown: AnswerBreakdown[];
  rank: number;
  weekNumber: number;
  streak: number;
  topic: string;
  topicSlug: string;
  topicEmoji: string;
  topicName: string;
  questions: ClientQuestion[];
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("bb_result");
    if (!stored) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  const scoreColor =
    result.score >= 8 ? "text-neon-green" : result.score >= 5 ? "text-neon-yellow" : "text-neon-pink";

  async function handleCopyShareText() {
    if (!result) return;
    const text = getShareText({
      score: result.score,
      timeSeconds: result.time_seconds,
      topic: result.topicName,
      weekNumber: result.weekNumber,
      streak: result.streak,
    });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="max-w-lg w-full animate-fade-in">
          {/* Score header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">
              {result.score === 10 ? "🧠" : result.score >= 8 ? "🔥" : result.score >= 5 ? "⚡" : "☕"}
            </div>
            <h1
              className={`text-6xl font-bold ${scoreColor} mb-2`}
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              {result.score}/10
            </h1>
            <p className="text-text-secondary">
              {result.topicEmoji} {result.topicName} · Week {result.weekNumber}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-neon-yellow font-medium">
                ⏱ {formatTime(result.time_seconds)}
              </span>
              <span className="text-text-secondary">·</span>
              <span className="text-neon-blue font-medium">
                #{result.rank} on leaderboard
              </span>
            </div>
          </div>

          {/* Badges */}
          {result.badges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-center text-text-secondary text-sm mb-3 uppercase tracking-wider">
                Badges Earned
              </h3>
              <BadgeDisplay badges={result.badges} />
            </div>
          )}

          {/* Answer breakdown */}
          <div className="mb-8">
            <h3 className="text-text-secondary text-sm mb-3 uppercase tracking-wider">
              Answer Breakdown
            </h3>
            <div className="space-y-2">
              {result.answers_breakdown.map((a, i) => {
                const q = result.questions[i];
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      a.is_correct
                        ? "bg-neon-green/5 border-neon-green/20"
                        : "bg-neon-pink/5 border-neon-pink/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">
                        {a.is_correct ? "✅" : a.selected === -1 ? "⏰" : "❌"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">
                          {q?.question || `Question ${i + 1}`}
                        </p>
                        {!a.is_correct && q && (
                          <p className="text-xs text-neon-green/70 mt-1">
                            Correct: {q.options[a.correct_index]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Share card download */}
          <div className="mb-4">
            <ShareCard
              score={result.score}
              timeSeconds={result.time_seconds}
              topic={result.topicName}
              topicEmoji={result.topicEmoji}
              weekNumber={result.weekNumber}
              streak={result.streak}
              badges={result.badges}
            />
          </div>

          {/* Copy share text */}
          <button
            onClick={handleCopyShareText}
            className="w-full py-3 px-6 bg-white/5 border border-white/10 text-text-primary rounded-xl font-medium hover:bg-white/10 transition mb-6"
          >
            {copied ? "✅ Copied to clipboard!" : "📋 Copy Share Text"}
          </button>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push(`/leaderboard?topic=${encodeURIComponent(result.topic)}`)}
              className="py-3 px-4 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-xl font-medium hover:bg-neon-blue/20 transition text-sm"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => router.push("/")}
              className="py-3 px-4 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-xl font-medium hover:bg-brand-orange/20 transition text-sm"
            >
              🎯 Play Another
            </button>
          </div>

          {/* No retry button — intentional */}
        </div>
      </main>
    </>
  );
}
