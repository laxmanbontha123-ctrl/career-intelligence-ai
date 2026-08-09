"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

type Skill = {
  name: string;
  category: string;
  requiredLevel: number;
  level: number;
};

const levels = [
  "Not started",
  "Basic awareness",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export default function AssessmentPage() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSkills() {
      try {
        const response = await fetch("/api/skills");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load assessment."
          );
        }

        setTargetRole(data.targetRole);
        setSkills(data.skills);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assessment."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, []);

  function updateLevel(index: number, level: number) {
    setSkills((current) =>
      current.map((skill, skillIndex) =>
        skillIndex === index
          ? { ...skill, level }
          : skill
      )
    );
  }

  async function handleSubmit() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save assessment."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save assessment."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="overflow-hidden relative grid min-h-screen place-items-center bg-[#050816] text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.52]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/assessment-skills-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.68),rgba(5,8,22,0.84)),radial-gradient(circle_at_top_right,rgba(76,29,149,0.14),transparent_42%)]"
      />
        <Loader2 className="animate-spin text-cyan-300" />
      </main>
    );
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-[#050816] px-4 py-10 text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.52]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/assessment-skills-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.68),rgba(5,8,22,0.84)),radial-gradient(circle_at_top_right,rgba(76,29,149,0.14),transparent_42%)]"
      />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <BrainCircuit className="text-cyan-300" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            AI Skill-Gap Assessment
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Measure your career readiness
          </h1>

          <p className="mt-3 text-slate-400">
            Target role:
            <span className="ml-2 font-semibold text-cyan-200">
              {targetRole}
            </span>
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-violet-400/20 bg-violet-400/[0.07] p-4">
            <Target className="mt-0.5 shrink-0 text-violet-300" />

            <p className="text-sm leading-6 text-slate-300">
              Rate your current ability honestly from 0 to 5.
              CareerIntel compares it with the required level
              for your selected career and calculates your skill gaps.
            </p>
          </div>

          <div className="space-y-4">
            {skills.map((skill, index) => (
              <article
                key={skill.name}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {skill.name}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {skill.category} · Required level{" "}
                      {skill.requiredLevel}/5
                    </p>
                  </div>

                  <select
                    value={skill.level}
                    onChange={(event) =>
                      updateLevel(
                        index,
                        Number(event.target.value)
                      )
                    }
                    className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                  >
                    {levels.map((label, level) => (
                      <option key={label} value={level}>
                        {level} — {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 rounded-full ${
                        level <= skill.level
                          ? "bg-gradient-to-r from-cyan-400 to-violet-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Sparkles size={19} />
            )}

            {saving
              ? "Analyzing skill gaps..."
              : "Analyze My Career Readiness"}

            {!saving && <ArrowRight size={18} />}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={14} />
            Your assessment can be updated anytime
          </div>
        </section>
      </div>
    </main>
  );
}