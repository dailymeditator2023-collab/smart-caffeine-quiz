"use client";

import { useEffect, useState, useRef } from "react";

interface QuestionTimerProps {
  duration: number; // seconds (default 10)
  isRunning: boolean;
  onTimeout: () => void;
}

export default function QuestionTimer({ duration = 10, isRunning, onTimeout }: QuestionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // Use setTimeout to avoid calling onTimeout during render
          setTimeout(() => onTimeoutRef.current(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 3;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">Time left</span>
        <span
          className={`text-sm font-mono font-bold ${
            isLow ? "text-neon-pink animate-pulse" : "text-text-primary"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isLow ? "bg-neon-pink" : "bg-brand-orange"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
