"use client";

import type { Topic } from "@/lib/topics";

interface TopicCardProps {
  topic: Topic;
  played: boolean;
  score?: number;
  onSelect: (topic: Topic) => void;
}

export default function TopicCard({ topic, played, score, onSelect }: TopicCardProps) {
  return (
    <button
      onClick={() => !played && onSelect(topic)}
      disabled={played}
      className={`relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
        played
          ? "border-white/5 bg-bg-card/50 opacity-60 cursor-not-allowed"
          : "border-white/10 bg-bg-card hover:border-brand-orange/50 hover:bg-bg-card-hover cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{topic.emoji}</span>
        <div className="flex-1">
          <h3
            className="font-bold text-text-primary text-lg"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {topic.name}
          </h3>
          {played ? (
            <p className="text-neon-green text-sm font-medium mt-0.5">
              ✅ Played — {score}/10
            </p>
          ) : (
            <p className="text-text-secondary text-sm mt-0.5">10 questions · Timed</p>
          )}
        </div>
        {!played && (
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {played && (
        <div className="absolute top-2 right-3">
          <span className="text-xs bg-white/5 text-text-secondary px-2 py-0.5 rounded-full">
            🔒 Locked
          </span>
        </div>
      )}
    </button>
  );
}
