"use client";

import { useState } from "react";
import type { ClientQuestion } from "@/lib/types";

interface QuizQuestionProps {
  question: ClientQuestion;
  onAnswer: (selectedIndex: number) => void;
}

/**
 * Shows a question with 4 options.
 * No correct_index available — just highlights the user's selection in blue.
 * Green/red feedback happens on the results page after batch submit.
 */
export default function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  function handleSelect(index: number) {
    if (locked) return;
    setSelected(index);
    setLocked(true);

    // Brief pause to show selection, then advance
    setTimeout(() => {
      onAnswer(index);
    }, 400);
  }

  return (
    <div className="animate-fade-in">
      <h2
        className="text-xl md:text-2xl font-bold text-text-primary mb-6 leading-snug"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          let classes =
            "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ";

          if (locked && index === selected) {
            classes += "option-selected";
          } else if (!locked) {
            classes +=
              "border-white/10 bg-bg-card text-text-primary hover:border-neon-blue/50 hover:bg-bg-card-hover cursor-pointer";
          } else {
            classes += "border-white/5 bg-bg-card/50 text-text-secondary";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={locked}
              className={classes}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-sm text-text-secondary mr-3 font-mono">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
