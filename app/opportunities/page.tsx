"use client";

import { useEffect, useMemo, useState } from "react";

type Skill = {
  name: string;
  level: number;
  requiredLevel: number;
  status: "STRONG" | "GOOD" | "PARTIAL";
};

type MissingSkill = {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
};

type Opportunity = {
  id: number;
  title: string;
  company: string;
  type: string;
  description: string;
  location: string | null;
  workMode: string | null;
  applicationUrl: string | null;
  deadline: string | null;
  matchScore: number;
  skillMatch: number;
  matchedSkills: Skill[];
  missingSkills: MissingSkill[];
  reasons: string[];
  saved: boolean;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  async function loadOpportunities() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/opportunities", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load opportunities."
        );
      }

      setOpportunities(data.opportunities || []);
      setTargetRole(data.targetRole || "");
      setReadinessScore(data.readinessScore || 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function toggleSave(id: number) {
    try {
      setSavingId(id);

      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opportunityId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save opportunity."
        );
      }

      setOpportunities((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, saved: data.saved }
            : item
        )
      );

      setSelected((current) =>
        current?.id === id
          ? { ...current, saved: data.saved }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update saved opportunity."
      );
    } finally {
      setSavingId(null);
    }
  }

  const topMatch = useMemo(
    () => opportunities[0] ?? null,
    [opportunities]
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-10 lg:px-14">

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/opportunities-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-[#020617]/85" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(139,92,246,0.08),transparent_35%)]" />
      </div>
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
            AI Career Intelligence
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Opportunities matched to
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              your career path.
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60 md:text-lg">
            Career Intelligence compares your current skills,
            target role and readiness to show where you fit
            today and what you need to become ready.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <p className="text-sm text-white/50">Target role</p>
            <p className="mt-2 text-lg font-medium text-white">
              {targetRole || "Not set"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <p className="text-sm text-white/50">Career readiness</p>
            <p className="mt-2 text-lg font-medium text-white">
              {readinessScore}%
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5 backdrop-blur-2xl">
            <p className="text-sm text-white/50">Best current match</p>
            <p className="mt-2 text-lg font-medium text-white">
              {topMatch
                ? `${topMatch.matchScore}%`
                : "—"}
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/60">
            No active opportunities found.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/50">
                      {opportunity.type}
                    </span>

                    <h2 className="mt-4 text-2xl font-semibold text-white">
                      {opportunity.title}
                    </h2>

                    <p className="mt-1 text-sm text-white/50">
                      {opportunity.company}
                    </p>
                  </div>

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
                    <span className="text-lg font-bold text-cyan-200">
                      {opportunity.matchScore}%
                    </span>
                  </div>
                </div>

                <p className="mt-5 line-clamp-3 text-sm leading-6 text-white/60">
                  {opportunity.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {opportunity.location && (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                      {opportunity.location}
                    </span>
                  )}

                  {opportunity.workMode && (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                      {opportunity.workMode}
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">
                      Skill alignment
                    </span>
                    <span className="text-sm font-medium text-white">
                      {opportunity.skillMatch}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all"
                      style={{
                        width: `${opportunity.skillMatch}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {opportunity.matchedSkills
                    .slice(0, 3)
                    .map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-full border border-emerald-300/10 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200"
                      >
                        ✓ {skill.name}
                      </span>
                    ))}

                  {opportunity.missingSkills
                    .slice(0, 2)
                    .map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-full border border-amber-300/10 bg-amber-300/10 px-3 py-1 text-xs text-amber-200"
                      >
                        ! {skill.name}
                      </span>
                    ))}
                </div>

                <div className="mt-7 flex gap-3">
                  <button
                    onClick={() => window.location.href = `/opportunities/prepare?opportunityId=${opportunity.id}`}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Why this match?
                  </button>

                  <button
                    onClick={() => toggleSave(opportunity.id)}
                    disabled={savingId === opportunity.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {opportunity.saved ? "Saved" : "Save"}
                  </button>
                </div>

                <button
                  onClick={() => window.location.href = `/opportunities/prepare?opportunityId=${opportunity.id}`}
                  className="mt-3 w-full rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-violet-400/20 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:from-cyan-400/30 hover:to-violet-400/30"
                >
                  Prepare Me →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-cyan-200">
                  {selected.company}
                </p>
                <h3 className="mt-1 text-3xl font-semibold text-white">
                  {selected.title}
                </h3>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-white/5 px-3 py-2 text-sm text-white/60"
              >
                Close
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/50">
                  Current match
                </p>
                <p className="mt-2 text-4xl font-bold text-cyan-200">
                  {selected.matchScore}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-white/50">
                  Skill alignment
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {selected.skillMatch}%
                </p>
              </div>
            </div>

            <div className="mt-7">
              <h4 className="text-lg font-semibold text-white">
                Why this match
              </h4>

              <div className="mt-4 space-y-3">
                {selected.reasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/70"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            {selected.missingSkills.length > 0 && (
              <div className="mt-7">
                <h4 className="text-lg font-semibold text-white">
                  Your priority gaps
                </h4>

                <div className="mt-4 space-y-3">
                  {selected.missingSkills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between rounded-2xl border border-amber-300/10 bg-amber-300/[0.05] p-4"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {skill.name}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Current {skill.currentLevel} · Target{" "}
                          {skill.requiredLevel}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
                        Gap {skill.gap}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelected(null);
                window.location.href =
                  `/roadmap?prepare=${selected.id}`;
              }}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-violet-400/30 px-5 py-4 font-semibold text-white ring-1 ring-white/10"
            >
              Prepare Me for This Opportunity →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}



