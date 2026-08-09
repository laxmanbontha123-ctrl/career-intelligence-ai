"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";

type Result = {
  score: number;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
};

export default function InterviewPage() {
  const [difficulty, setDifficulty] =
    useState("Intermediate");
  const [focusArea, setFocusArea] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] =
    useState<Result | null>(null);
  const [generating, setGenerating] =
    useState(false);
  const [evaluating, setEvaluating] =
    useState(false);
  const [error, setError] = useState("");

  async function generateQuestion() {
    setGenerating(true);
    setError("");
    setResult(null);
    setAnswer("");

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate question."
        );
      }

      setQuestion(data.question);
      setFocusArea(data.focusArea);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate question."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function evaluateAnswer() {
    if (!question || answer.trim().length < 20) {
      setError(
        "Write a meaningful answer before evaluation."
      );
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "evaluate",
          difficulty,
          question,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to evaluate answer."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to evaluate answer."
      );
    } finally {
      setEvaluating(false);
    }
  }

  const scoreColor =
    result && result.score >= 75
      ? "text-emerald-300"
      : result && result.score >= 50
        ? "text-cyan-300"
        : "text-amber-300";

  return (
    <main className="overflow-hidden relative min-h-screen bg-[#050816] px-4 py-10 text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.35]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/interview-ai-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.74),rgba(5,8,22,0.88)),radial-gradient(circle_at_top_right,rgba(76,29,149,0.12),transparent_42%)]"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header className="mt-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
            <BrainCircuit className="text-violet-300" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Gemini Interview Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            AI Mock Interview Coach
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Practice target-role questions and receive instant,
            personalized technical feedback.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <label className="text-sm font-semibold text-slate-300">
                Interview Difficulty
              </label>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  "Beginner",
                  "Intermediate",
                  "Advanced",
                ].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setDifficulty(level);
                      setQuestion("");
                      setResult(null);
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      difficulty === level
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 bg-black/20 text-slate-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={generateQuestion}
                disabled={generating}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3.5 font-semibold text-slate-950 disabled:opacity-50"
              >
                {generating ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : question ? (
                  <RefreshCw size={18} />
                ) : (
                  <Sparkles size={18} />
                )}

                {generating
                  ? "Generating question..."
                  : question
                    ? "Generate Another Question"
                    : "Start Mock Interview"}
              </button>
            </div>

            {question && (
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    <MessageSquareText size={16} />
                    Interview Question
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400">
                    {focusArea}
                  </span>
                </div>

                <p className="mt-4 text-lg font-medium leading-8">
                  {question}
                </p>
              </div>
            )}

            {question && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <label className="text-sm font-semibold text-slate-300">
                  Your Answer
                </label>

                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  rows={9}
                  maxLength={6000}
                  placeholder="Explain your answer clearly, like you are speaking to an interviewer..."
                  className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/40"
                />

                <div className="mt-2 text-right text-xs text-slate-500">
                  {answer.length}/6000
                </div>

                <button
                  type="button"
                  onClick={evaluateAnswer}
                  disabled={
                    evaluating ||
                    answer.trim().length < 20
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-cyan-400 px-5 py-3.5 font-semibold text-slate-950 disabled:opacity-50"
                >
                  {evaluating ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}

                  {evaluating
                    ? "Evaluating your answer..."
                    : "Evaluate My Answer"}
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          <div>
            {!result ? (
              <div className="grid min-h-[520px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <div>
                  <Trophy
                    size={42}
                    className="relative z-10 mx-auto text-slate-600"
                  />

                  <h2 className="mt-4 text-xl font-semibold">
                    Your interview evaluation will appear here
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Receive a score, strengths, improvements and
                    an ideal model answer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl border border-violet-400/20 bg-violet-400/[0.07] p-6">
                  <p className="text-sm text-slate-400">
                    Interview Answer Score
                  </p>

                  <p
                    className={`mt-2 text-5xl font-bold ${scoreColor}`}
                  >
                    {result.score}%
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                      style={{
                        width: `${result.score}%`,
                      }}
                    />
                  </div>
                </div>

                <FeedbackCard
                  title="What You Did Well"
                  items={result.strengths}
                  positive
                />

                <FeedbackCard
                  title="How to Improve"
                  items={result.improvements}
                />

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
                  <h3 className="font-semibold text-cyan-200">
                    Ideal Interview Answer
                  </h3>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {result.idealAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeedbackCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="font-semibold">{title}</h3>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 text-sm leading-6 text-slate-300"
          >
            {positive ? (
              <CheckCircle2
                size={16}
                className="mt-1 shrink-0 text-emerald-300"
              />
            ) : (
              <AlertTriangle
                size={16}
                className="mt-1 shrink-0 text-amber-300"
              />
            )}

            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}