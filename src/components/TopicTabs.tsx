"use client";

import { TOPICS } from "@/lib/topics";

interface TopicTabsProps {
  selected: string; // "All" or topic dbName
  onSelect: (value: string) => void;
}

export default function TopicTabs({ selected, onSelect }: TopicTabsProps) {
  const tabs = [
    { label: "All", value: "All", emoji: "🌟" },
    ...TOPICS.map((t) => ({ label: t.name, value: t.dbName, emoji: t.emoji })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onSelect(tab.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === tab.value
              ? "bg-neon-blue/20 border border-neon-blue/50 text-neon-blue"
              : "bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10"
          }`}
        >
          <span>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
