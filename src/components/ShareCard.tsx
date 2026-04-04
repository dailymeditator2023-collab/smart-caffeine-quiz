"use client";

import { useRef, useCallback } from "react";
import { formatTime } from "@/lib/week";

interface ShareCardProps {
  score: number;
  timeSeconds: number;
  topic: string;
  topicEmoji: string;
  weekNumber: number;
  streak: number;
  badges: string[];
}

export default function ShareCard({
  score,
  timeSeconds,
  topic,
  topicEmoji,
  weekNumber,
  streak,
  badges,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, "#0a0e1a");
    gradient.addColorStop(0.5, "#111827");
    gradient.addColorStop(1, "#0a0e1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative grid lines (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 1080; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1920);
      ctx.stroke();
    }
    for (let i = 0; i < 1920; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1080, i);
      ctx.stroke();
    }

    // Smart Caffeine branding
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillStyle = "#ff6633";
    ctx.textAlign = "center";
    ctx.fillText("☕ SMART CAFFEINE", 540, 200);

    // Week badge
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`SMART CAFFEINE QUIZ · WEEK ${weekNumber}`, 540, 260);

    // Topic pill
    const topicText = `${topicEmoji} ${topic}`;
    ctx.font = "bold 32px system-ui, sans-serif";
    const topicWidth = ctx.measureText(topicText).width + 60;
    const pillX = 540 - topicWidth / 2;
    ctx.fillStyle = "rgba(77, 141, 255, 0.15)";
    roundRect(ctx, pillX, 310, topicWidth, 56, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(77, 141, 255, 0.4)";
    ctx.lineWidth = 2;
    roundRect(ctx, pillX, 310, topicWidth, 56, 28);
    ctx.stroke();
    ctx.fillStyle = "#4d8dff";
    ctx.fillText(topicText, 540, 348);

    // Score (big)
    ctx.font = "bold 220px system-ui, sans-serif";
    ctx.fillStyle = score >= 8 ? "#00FFaa" : score >= 5 ? "#ffe14d" : "#ff3a6e";
    ctx.fillText(`${score}`, 540, 620);
    ctx.font = "bold 60px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("/ 10", 540, 700);

    // Time
    ctx.font = "bold 48px system-ui, sans-serif";
    ctx.fillStyle = "#ffe14d";
    ctx.fillText(`⏱ ${formatTime(timeSeconds)}`, 540, 800);

    // Badges
    if (badges.length > 0) {
      ctx.font = "32px system-ui, sans-serif";
      ctx.fillStyle = "#ffe14d";
      badges.forEach((badge, i) => {
        ctx.fillText(badge, 540, 900 + i * 50);
      });
    }

    // Streak
    if (streak >= 2) {
      const streakY = 900 + badges.length * 50 + 40;
      ctx.font = "bold 36px system-ui, sans-serif";
      ctx.fillStyle = "#ff3a6e";
      ctx.fillText(`🔥 ${streak} WEEK STREAK`, 540, streakY);
    }

    // Viral hook
    const hookY = 1400;
    ctx.fillStyle = "rgba(255, 58, 110, 0.1)";
    roundRect(ctx, 90, hookY - 40, 900, 70, 16);
    ctx.fill();
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.fillStyle = "#ff3a6e";
    ctx.fillText("⚠️  ONE ATTEMPT ONLY — NO RETRIES", 540, hookY);

    // CTA
    ctx.font = "bold 40px system-ui, sans-serif";
    ctx.fillStyle = "#ff6633";
    ctx.fillText("⚡ BEAT MY SCORE ⚡", 540, 1560);

    // URL
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("smartcaffeine.com/quiz", 540, 1620);

    // Download
    const link = document.createElement("a");
    link.download = `smart-caffeine-quiz-week${weekNumber}-${topic.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [score, timeSeconds, topic, topicEmoji, weekNumber, streak, badges]);

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generateCard}
        className="w-full py-4 px-6 bg-gradient-to-r from-brand-orange/20 to-neon-blue/20 border-2 border-brand-orange/30 text-brand-orange rounded-xl font-bold text-lg hover:border-brand-orange/60 transition-all"
      >
        📥 Download Share Card (1080×1920)
      </button>
    </div>
  );
}

// Helper: draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
