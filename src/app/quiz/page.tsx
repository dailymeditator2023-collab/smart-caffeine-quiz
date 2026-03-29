"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import UserGuard from "@/components/UserGuard";
import QuestionTimer from "@/components/QuestionTimer";
import ProgressPips from "@/components/ProgressPips";
import QuizQuestion from "@/components/QuizQuestion";
import { getTopicBySlug } from "@/lib/topics";
import type { ClientQuestion } from "@/lib/types";

function QuizContent({ user }: { user: { email: string; name: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicSlug = searchParams.get("topic") || "";
  const topic = getTopicBySlug(topicSlug);

  const [stage, setStage] = useState<"loading" | "quiz" | "submitting" | "error">("loading");
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [timerKey, setTimerKey] = useState(0); // force re-mount timer per question
  const [error, setError] = useState("");
  const startTimeRef = useRef(0);
  const timerActiveRef = useRef(true);

  // Load questions
  useEffect(() => {
    if (!topic) {
      setError("Invalid topic");
      setStage("error");
      return;
    }

    fetch(`/api/questions?topic=${encodeURIComponent(topic.dbName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions);
        setQuestionIds(data.questions.map((q: ClientQuestion) => q.id));
        setWeekNumber(data.weekNumber);
        startTimeRef.current = Date.now();
        setStage("quiz");
      })
      .catch((e) => {
        setError(e.message || "Failed to load questions");
        setStage("error");
      });
  }, [topic]);

  const submitQuiz = useCallback(
    async (answers: number[]) => {
      if (!topic) return;
      setStage("submitting");

      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const payload = {
        email: user.email,
        topic: topic.dbName,
        time_seconds: timeSeconds,
        answers: questionIds.map((id, i) => ({
          question_id: id,
          selected: answers[i] ?? -1,
        })),
      };

      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (!res.ok) {
          if (res.status === 409) {
            setError("You already attempted this topic this week!");
            setStage("error");
            return;
          }
          throw new Error(result.error || "Submission failed");
        }

        // Store result in sessionStorage for the result page
        sessionStorage.setItem(
          "bb_result",
          JSON.stringify({
            ...result,
            topic: topic.dbName,
            topicSlug: topic.slug,
            topicEmoji: topic.emoji,
            topicName: topic.name,
            questions,
          })
        );

        router.push("/result");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submission failed");
        setStage("error");
      }
    },
    [topic, user.email, questionIds, questions, router]
  );

  const advanceQuestion = useCallback(
    (selectedIndex: number) => {
      const newAnswers = [...selectedAnswers, selectedIndex];
      setSelectedAnswers(newAnswers);
      timerActiveRef.current = false;

      if (currentQ < questions.length - 1) {
        // Next question
        setTimeout(() => {
          setCurrentQ((q) => q + 1);
          setTimerKey((k) => k + 1);
          timerActiveRef.current = true;
        }, 300);
      } else {
        // Last question — submit
        submitQuiz(newAnswers);
      }
    },
    [selectedAnswers, currentQ, questions.length, submitQuiz]
  );

  const handleTimeout = useCallback(() => {
    // -1 means timed out
    advanceQuestion(-1);
  }, [advanceQuestion]);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      advanceQuestion(selectedIndex);
    },
    [advanceQuestion]
  );

  if (!topic) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-neon-pink text-lg">Invalid topic</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-brand-orange text-bg-dark rounded-xl font-medium"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="max-w-lg w-full">
          {/* Topic + Week header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{topic.emoji}</span>
              <span className="font-bold text-text-primary">{topic.name}</span>
            </div>
            <span className="text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-full">
              Week {weekNumber}
            </span>
          </div>

          {/* Loading */}
          {stage === "loading" && (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-text-secondary">Loading questions...</p>
            </div>
          )}

          {/* Quiz */}
          {stage === "quiz" && questions[currentQ] && (
            <div>
              {/* Progress pips */}
              <ProgressPips
                total={questions.length}
                current={currentQ}
                answers={selectedAnswers}
              />

              {/* Timer */}
              <div className="mt-4 mb-6">
                <QuestionTimer
                  key={timerKey}
                  duration={10}
                  isRunning={true}
                  onTimeout={handleTimeout}
                />
              </div>

              {/* Question */}
              <QuizQuestion
                key={currentQ}
                question={questions[currentQ]}
                onAnswer={handleAnswer}
              />

              {/* Question number */}
              <p className="text-center text-text-secondary text-sm mt-6">
                Question {currentQ + 1} of {questions.length}
              </p>
            </div>
          )}

          {/* Submitting */}
          {stage === "submitting" && (
            <div className="text-center py-20 animate-fade-in">
              <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-text-secondary">Calculating your score...</p>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-4xl mb-4">😵</div>
              <p className="text-neon-pink text-lg mb-4">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-brand-orange text-bg-dark rounded-xl font-medium"
              >
                Go Home
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function QuizInner() {
  return (
    <UserGuard>
      {(user) => (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" /></div>}>
          <QuizContent user={user} />
        </Suspense>
      )}
    </UserGuard>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" /></div>}>
      <QuizInner />
    </Suspense>
  );
}
