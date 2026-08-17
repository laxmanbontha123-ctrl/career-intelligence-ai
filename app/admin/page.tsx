"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  BrainCircuit,
  GraduationCap,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

type DashboardData = {
  overview: {
    totalLearners: number;
    activeLearners: number;
    completedProfiles: number;
    profileCompletion: number;
    averageReadiness: number;
    roadmapCompletion: number;
    missionCompletion: number;
    opportunities: number;
    savedOpportunities: number;
    checkIns: number;
    mentorMessages: number;
    interviewAttempts: number;
    interviewAverage: number;
    resumeAnalyses: number;
    averageAtsScore: number;
  };
  targetRoles: {
    role: string | null;
    count: number;
  }[];
  skills: {
    name: string;
    learners: number;
    averageLevel: number;
  }[];
  recentLearners: {
    id: number;
    name: string;
    targetRole: string;
    readinessScore: number;
    updatedAt: string;
  }[];
};

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

export default function AdminIntelligencePage() {
  const [data, setData] =
    useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/intelligence", {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load intelligence."
          );
        }

        return result;
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load intelligence."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-5 py-10 text-white md:px-10">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="/videos/dashboard-intelligence-background.mp4"
          type="video/mp4"
        />
      </video>

      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.75),rgba(5,8,22,0.9))]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
            >
              <ArrowLeft size={16} />
              Back to learner dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                <BrainCircuit className="text-cyan-300" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  CareerIntel AI
                </p>
                <h1 className="mt-1 text-3xl font-bold md:text-4xl">
                  Administrator Intelligence
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-3xl text-slate-400">
              Organization-wide insight into learner engagement,
              career readiness, skill demand and opportunity activity.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-3xl bg-white/5"
              />
            ))}
          </div>
        ) : error || !data ? (
          <div className="rounded-3xl border border-red-300/10 bg-red-300/[0.05] p-8 text-red-200">
            {error || "Unable to load administrator intelligence."}
          </div>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total learners"
                value={data.overview.totalLearners}
                detail={`${data.overview.profileCompletion}% completed profiles`}
                icon={Users}
              />

              <StatCard
                label="Active learners"
                value={data.overview.activeLearners}
                detail="Updated in the last 7 days"
                icon={Activity}
              />

              <StatCard
                label="Average readiness"
                value={`${data.overview.averageReadiness}%`}
                detail="Across learner profiles"
                icon={TrendingUp}
              />

              <StatCard
                label="Opportunity demand"
                value={data.overview.savedOpportunities}
                detail={`${data.overview.opportunities} active opportunities`}
                icon={BriefcaseBusiness}
              />
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-3">
              <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Target className="text-cyan-300" size={18} />
                  <h2 className="text-lg font-semibold">
                    Career interests
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {data.targetRoles.map((item) => {
                    const max =
                      data.targetRoles[0]?.count || 1;

                    return (
                      <div key={item.role}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.role}
                          </span>
                          <span className="text-cyan-300">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                            style={{
                              width: `${Math.max(
                                8,
                                (item.count / max) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <GraduationCap
                    className="text-violet-300"
                    size={18}
                  />
                  <h2 className="text-lg font-semibold">
                    Learning health
                  </h2>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Roadmap completion
                      </span>
                      <span className="text-white">
                        {data.overview.roadmapCompletion}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{
                          width: `${data.overview.roadmapCompletion}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Mission completion
                      </span>
                      <span className="text-white">
                        {data.overview.missionCompletion}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-violet-400"
                        style={{
                          width: `${data.overview.missionCompletion}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-500">
                        Check-ins
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {data.overview.checkIns}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-500">
                        AI support
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {data.overview.mentorMessages}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <BrainCircuit
                    className="text-amber-300"
                    size={18}
                  />
                  <h2 className="text-lg font-semibold">
                    Skill demand
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {data.skills.slice(0, 8).map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {skill.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {skill.learners} learners
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-amber-300">
                          Level {skill.averageLevel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <MessageCircle
                    className="text-emerald-300"
                    size={18}
                  />
                  <h2 className="text-lg font-semibold">
                    Career support signals
                  </h2>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">
                      Mentor messages
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {data.overview.mentorMessages}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">
                      Interview attempts
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {data.overview.interviewAttempts}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">
                      Interview average
                    </p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">
                      {data.overview.interviewAverage}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">
                      Average ATS score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-violet-300">
                      {data.overview.averageAtsScore}%
                    </p>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent learner activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Learners most recently active in the platform.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="pb-3">Learner</th>
                      <th className="pb-3">Target role</th>
                      <th className="pb-3">Readiness</th>
                      <th className="pb-3">Last active</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {data.recentLearners.map((learner) => (
                      <tr key={learner.id}>
                        <td className="py-4 font-medium text-white">
                          {learner.name}
                        </td>

                        <td className="py-4 text-slate-400">
                          {learner.targetRole}
                        </td>

                        <td className="py-4">
                          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                            {learner.readinessScore}%
                          </span>
                        </td>

                        <td className="py-4 text-slate-500">
                          {new Date(
                            learner.updatedAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
