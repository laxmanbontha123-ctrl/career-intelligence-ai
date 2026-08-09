import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  FileSearch,
  Map,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/register");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      learnerProfile: true,
      userSkills: true,
    },
  });

  if (!user) {
    redirect("/register");
  }

  if (!user.profileCompleted || !user.learnerProfile) {
    redirect("/onboarding");
  }

  const requiredSkills = getRequiredSkills(
    user.targetRole || ""
  );

  const skillAnalysis = requiredSkills
    .map((required) => {
      const saved = user.userSkills.find(
        (skill) => skill.name === required.name
      );

      const currentLevel = saved?.level || 0;
      const gap = Math.max(
        required.requiredLevel - currentLevel,
        0
      );

      return {
        ...required,
        currentLevel,
        gap,
        progress: Math.min(
          Math.round(
            (currentLevel / required.requiredLevel) * 100
          ),
          100
        ),
      };
    })
    .sort((a, b) => b.gap - a.gap);

  const assessmentCompleted = user.userSkills.length > 0;
  const priorityGaps = skillAnalysis
    .filter((skill) => skill.gap > 0)
    .slice(0, 3);

  const readinessColor =
    user.readinessScore >= 75
      ? "text-emerald-300"
      : user.readinessScore >= 50
        ? "text-cyan-300"
        : "text-violet-300";

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <BrainCircuit className="text-cyan-300" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              CareerIntel AI
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Career Intelligence Dashboard
            </h1>

            <p className="mt-3 text-slate-400">
              Personalized analysis for your career journey.
            </p>
          </div>

          <Link
            href="/assessment"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <RefreshCw size={17} />
            {assessmentCompleted
              ? "Update Assessment"
              : "Start Assessment"}
          </Link>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Target size={17} />
              Target Career
            </div>

            <p className="mt-3 text-xl font-semibold text-cyan-200">
              {user.targetRole}
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GraduationCap size={17} />
              Academic Profile
            </div>

            <p className="mt-3 text-xl font-semibold">
              {user.learnerProfile.degree}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {user.learnerProfile.branch}
            </p>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/[0.07] p-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TrendingUp size={17} />
              Career Readiness
            </div>

            <p className={`mt-3 text-4xl font-bold ${readinessColor}`}>
              {user.readinessScore}%
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500"
                style={{
                  width: `${user.readinessScore}%`,
                }}
              />
            </div>
          </article>
        </section>

        {!assessmentCompleted ? (
          <section className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-8 text-center">
            <Sparkles className="mx-auto text-cyan-300" />

            <h2 className="mt-4 text-2xl font-bold">
              Discover your career skill gaps
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-slate-400">
              Complete the assessment to receive your readiness
              score and personalized improvement priorities.
            </p>

            <Link
              href="/assessment"
              className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950"
            >
              Start Skill Assessment
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                      Skill Intelligence
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Current skill analysis
                    </h2>
                  </div>

                  <Sparkles className="text-violet-300" />
                </div>

                <div className="mt-6 space-y-5">
                  {skillAnalysis.map((skill) => (
                    <div key={skill.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {skill.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Current {skill.currentLevel}/5 ·
                            Required {skill.requiredLevel}/5
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            skill.gap === 0
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {skill.gap === 0
                            ? "Ready"
                            : `Gap ${skill.gap}`}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          style={{
                            width: `${skill.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  Priority Gaps
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Focus here first
                </h2>

                <div className="mt-6 space-y-3">
                  {priorityGaps.length > 0 ? (
                    priorityGaps.map((skill, index) => (
                      <div
                        key={skill.name}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-sm font-bold text-violet-300">
                            {index + 1}
                          </span>

                          <div>
                            <p className="font-semibold">
                              {skill.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Improve by {skill.gap} level
                              {skill.gap > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-300">
                      You currently meet all required skill levels.
                    </div>
                  )}
                </div>

                <Link
                  href="/roadmap"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Generate AI Roadmap
                  <ArrowRight size={17} />
                </Link>

                <p className="mt-2 text-center text-xs text-slate-500">
                  Generated from your highest-priority skill gaps
                </p>
              </aside>
            </section>
          </>
        )}
        <section className="mt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Career Tools
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Continue your career journey
            </h2>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Link
              href="/assessment"
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
            >
              <Target className="text-cyan-300" />

              <h3 className="mt-4 text-lg font-semibold">
                Skill Assessment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Update your skill levels and recalculate your
                career-readiness score.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                Update assessment
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            <Link
              href="/roadmap"
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-400/[0.06]"
            >
              <Map className="text-violet-300" />

              <h3 className="mt-4 text-lg font-semibold">
                30-Day Roadmap
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Follow personalized learning phases and track
                completion progress.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-200">
                Open roadmap
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            <Link
              href="/resume-analyzer"
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]"
            >
              <FileSearch className="text-emerald-300" />

              <h3 className="mt-4 text-lg font-semibold">
                Resume Intelligence
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Analyze ATS compatibility and target-role
                keyword alignment.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                Analyze resume
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}