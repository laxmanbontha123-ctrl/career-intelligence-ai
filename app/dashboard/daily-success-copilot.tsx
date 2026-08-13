"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Mission = {
  id: number;
  category: string;
  title: string;
  description: string;
  actionUrl: string | null;
  estimatedMinutes: number;
  completed: boolean;
};

type CopilotData = {
  success: boolean;
  dateKey: string;
  targetRole: string | null;
  missions: Mission[];
  summary: {
    completed: number;
    total: number;
    percentage: number;
  };
  streak: number;
};

function getCategoryStyle(category: string) {
  if (category === "SKILL") {
    return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
  }

  if (category === "ACADEMIC") {
    return "border-violet-400/20 bg-violet-400/10 text-violet-200";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
}

export function DailySuccessCopilot() {
  const [data, setData] = useState<CopilotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/daily-copilot", {
        cache: "no-store",
      });

      const result = (await response.json()) as
        | CopilotData
        | { success: false; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(
          "message" in result && result.message
            ? result.message
            : "Unable to load today's success plan."
        );
      }

      setData(result as CopilotData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load today's success plan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#091126]/90 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles size={15} />
              Daily AI Success Copilot
            </div>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Today's personalized success plan
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Academic focus, priority skills and career execution
              combined into one achievable daily plan.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/[0.08] px-4 py-3">
              <div className="flex items-center gap-2 text-orange-200">
                <Flame size={18} />
                <span className="text-xl font-bold">
                  {data?.streak ?? 0}
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
                Day streak
              </p>
            </div>

            <div className="min-w-28 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3">
              <div className="flex items-center gap-2 text-cyan-200">
                <CalendarCheck2 size={18} />
                <span className="text-xl font-bold">
                  {data?.summary.percentage ?? 0}%
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
                Today
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 transition-all duration-500"
            style={{
              width: `${data?.summary.percentage ?? 0}%`,
            }}
          />
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]"
              />
            ))}
          </div>
        ) : error && !data ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] p-5">
            <p className="text-sm text-rose-200">{error}</p>
            <button
              type="button"
              onClick={() => void loadMissions()}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {data?.missions.map((mission) => (
              <article
                key={mission.id}
                className={`group relative flex min-h-52 flex-col rounded-2xl border p-5 transition ${
                  mission.completed
                    ? "border-emerald-400/25 bg-emerald-400/[0.07]"
                    : "border-white/10 bg-black/20 hover:-translate-y-1 hover:border-cyan-400/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryStyle(
                      mission.category
                    )}`}
                  >
                    {mission.category}
                  </span>

                  <div
                    title={
                      mission.completed
                        ? "Learning verified"
                        : "Lesson, practical task and quiz required"
                    }
                    className={
                      mission.completed
                        ? "flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
                        : "rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200"
                    }
                  >
                    {mission.completed ? (
                      <>
                        <CheckCircle2 size={20} />
                        Verified
                      </>
                    ) : (
                      "Quiz required"
                    )}
                  </div>
                </div>

                <h3
                  className={`mt-4 text-lg font-semibold ${
                    mission.completed
                      ? "text-emerald-100 line-through decoration-emerald-400/50"
                      : "text-white"
                  }`}
                >
                  {mission.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                  {mission.description}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock3 size={14} />
                    {mission.estimatedMinutes} min
                  </span>

                  <Link
                    href={`/learn/${mission.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    {mission.completed
                      ? "Review verified lesson"
                      : "Start verified task"}
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {error && data && (
          <p className="mt-4 text-sm text-rose-300">{error}</p>
        )}

        {data &&
          data.summary.total > 0 &&
          data.summary.completed === data.summary.total && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.09] p-4 text-emerald-100">
              <CheckCircle2 className="shrink-0 text-emerald-300" />
              <p className="text-sm font-medium">
                Daily mission complete. Your readiness and consistency
                are moving forward.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
