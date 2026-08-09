"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";

const careerRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI / ML Engineer",
  "Data Analyst",
  "Data Scientist",
  "Cloud / DevOps Engineer",
  "Cybersecurity Engineer",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    institution: "",
    degree: "B.Tech",
    branch: "Computer Science and Engineering",
    currentYear: "3",
    cgpa: "",
    graduationYear: "",
    experienceLevel: "Student",
    preferredWorkMode: "Remote",
    location: "",
    bio: "",
    targetRole: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save profile."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save profile."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-10 text-white">
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
          src="/videos/onboarding-profile-background.mp4"
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
            CareerIntel AI
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Build your learner intelligence profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            This information helps CareerIntel understand your
            academic background and create personalized career
            recommendations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <GraduationCap size={16} />
                Institution *
              </label>

              <input
                className={inputClass}
                value={form.institution}
                onChange={(e) =>
                  update("institution", e.target.value)
                }
                placeholder="Your college or university"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Degree *
              </label>

              <input
                className={inputClass}
                value={form.degree}
                onChange={(e) =>
                  update("degree", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Branch / Specialization *
              </label>

              <input
                className={inputClass}
                value={form.branch}
                onChange={(e) =>
                  update("branch", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Current Year *
              </label>

              <select
                className={inputClass}
                value={form.currentYear}
                onChange={(e) =>
                  update("currentYear", e.target.value)
                }
              >
                <option value="1" className="bg-slate-950">
                  1st Year
                </option>
                <option value="2" className="bg-slate-950">
                  2nd Year
                </option>
                <option value="3" className="bg-slate-950">
                  3rd Year
                </option>
                <option value="4" className="bg-slate-950">
                  4th Year
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                CGPA
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                className={inputClass}
                value={form.cgpa}
                onChange={(e) =>
                  update("cgpa", e.target.value)
                }
                placeholder="Example: 8.2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Graduation Year
              </label>

              <input
                type="number"
                min="2026"
                max="2040"
                className={inputClass}
                value={form.graduationYear}
                onChange={(e) =>
                  update("graduationYear", e.target.value)
                }
                placeholder="Example: 2027"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <BriefcaseBusiness size={16} />
                Experience Level
              </label>

              <select
                className={inputClass}
                value={form.experienceLevel}
                onChange={(e) =>
                  update("experienceLevel", e.target.value)
                }
              >
                <option className="bg-slate-950">
                  Student
                </option>
                <option className="bg-slate-950">
                  Beginner
                </option>
                <option className="bg-slate-950">
                  Intermediate
                </option>
                <option className="bg-slate-950">
                  Advanced
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Preferred Work Mode
              </label>

              <select
                className={inputClass}
                value={form.preferredWorkMode}
                onChange={(e) =>
                  update("preferredWorkMode", e.target.value)
                }
              >
                <option className="bg-slate-950">
                  Remote
                </option>
                <option className="bg-slate-950">
                  Hybrid
                </option>
                <option className="bg-slate-950">
                  On-site
                </option>
                <option className="bg-slate-950">
                  Flexible
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={16} />
                Location
              </label>

              <input
                className={inputClass}
                value={form.location}
                onChange={(e) =>
                  update("location", e.target.value)
                }
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-200">
                <Sparkles size={16} />
                Target Career Role *
              </label>

              <select
                className={inputClass}
                value={form.targetRole}
                onChange={(e) =>
                  update("targetRole", e.target.value)
                }
                required
              >
                <option value="" className="bg-slate-950">
                  Select your career goal
                </option>

                {careerRoles.map((role) => (
                  <option
                    key={role}
                    value={role}
                    className="bg-slate-950"
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Tell CareerIntel about your goals
              </label>

              <textarea
                rows={4}
                className={inputClass}
                value={form.bio}
                onChange={(e) =>
                  update("bio", e.target.value)
                }
                placeholder="Example: I want to become a cloud engineer and get a strong internship before graduation."
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={19} />
            )}

            {loading
              ? "Building learner profile..."
              : "Create My Career Intelligence Profile"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </main>
  );
}
