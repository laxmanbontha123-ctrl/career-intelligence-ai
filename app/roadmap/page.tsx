"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Map,
  Sparkles,
  Target,
} from "lucide-react";

type Phase = {
  title: string;
  days: string;
  description: string;
  taskKey: string;
  completed: boolean;
};

type RoadmapItem = {
  priority: number;
  skill: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  startDay: number;
  endDay: number;
  phases: Phase[];
};

type RoadmapData = {
  targetRole: string;
  readinessScore: number;
  durationDays: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  roadmap: RoadmapItem[];
};

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function generateRoadmap() {
      try {
        const response = await fetch("/api/roadmap");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to generate roadmap."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate roadmap."
        );
      } finally {
        setLoading(false);
      }
    }

    generateRoadmap();
  }, []);

  async function toggleTask(
    skill: string,
    phase: Phase
  ) {
    if (!data) return;

    const nextCompleted = !phase.completed;

    setData((current) => {
      if (!current) return current;

      const roadmap = current.roadmap.map((item) => ({
        ...item,
        phases: item.phases.map((currentPhase) =>
          currentPhase.taskKey === phase.taskKey
            ? {
                ...currentPhase,
                completed: nextCompleted,
              }
            : currentPhase
        ),
      }));

      const completedTasks = roadmap.reduce(
        (sum, item) =>
          sum +
          item.phases.filter((task) => task.completed)
            .length,
        0
      );

      return {
        ...current,
        roadmap,
        completedTasks,
        progressPercentage: Math.round(
          (completedTasks / current.totalTasks) * 100
        ),
      };
    });

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskKey: phase.taskKey,
          skill,
          phase: phase.title,
          completed: nextCompleted,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save progress."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save progress."
      );

      window.location.reload();
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050816] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-cyan-300" />

          <p className="mt-4 text-sm text-slate-400">
            CareerIntel is generating your roadmap...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {error || !data ? (
          <section className="mt-8 rounded-3xl border border-red-400/20 bg-red-400/[0.07] p-8 text-center">
            <p className="text-red-300">
              {error || "Unable to load roadmap."}
            </p>

            <Link
              href="/assessment"
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
            >
              Complete Assessment
            </Link>
          </section>
        ) : (
          <>
            <header className="mt-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
                <BrainCircuit className="text-violet-300" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Personalized Intelligence Plan
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Your 30-Day Career Roadmap
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Built from your current skills, target career
                requirements and highest-priority gaps.
              </p>
            </header>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Target size={16} />
                  Target Role
                </div>

                <p className="mt-2 font-semibold text-cyan-200">
                  {data.targetRole}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Sparkles size={16} />
                  Current Readiness
                </div>

                <p className="mt-2 text-2xl font-bold text-violet-300">
                  {data.readinessScore}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CalendarDays size={16} />
                  Learning Duration
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {data.durationDays} Days
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 size={16} />
                  Roadmap Progress
                </div>

                <p className="mt-2 text-2xl font-bold text-emerald-300">
                  {data.progressPercentage}%
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${data.progressPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {data.completedTasks}/{data.totalTasks} phases completed
                </p>
              </div>
            </section>

            <section className="mt-8 space-y-6">
              {data.roadmap.map((item) => (
                <article
                  key={item.skill}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  <div className="flex flex-col justify-between gap-5 border-b border-white/10 p-6 md:flex-row md:items-center">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-slate-950">
                        {item.priority}
                      </span>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Days {item.startDay}–{item.endDay} ·{" "}
                          {item.category}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {item.skill}
                        </h2>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-2 text-sm text-amber-200">
                      Level {item.currentLevel} →{" "}
                      {item.targetLevel}
                    </div>
                  </div>

                  <div className="grid gap-4 p-6 lg:grid-cols-3">
                    {item.phases.map((phase) => (
                      <div
                        key={phase.title}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                          <CheckCircle2 size={15} />
                          {phase.days}
                        </div>

                        <h3 className="mt-3 font-semibold">
                          {phase.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {phase.description}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            toggleTask(item.skill, phase)
                          }
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                            phase.completed
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
                          }`}
                        >
                          <CheckCircle2 size={16} />

                          {phase.completed
                            ? "Completed"
                            : "Mark Complete"}
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
              <Map className="mt-0.5 shrink-0 text-cyan-300" />

              <p className="text-sm leading-6 text-slate-300">
                Complete each phase with practical evidence.
                Update your assessment after 30 days to measure
                your improvement and generate the next roadmap.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}