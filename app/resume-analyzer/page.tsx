"use client";

import Link from "next/link";
import { type ChangeEvent, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  Upload,
  X,
  Sparkles,
  Target,
} from "lucide-react";

type Analysis = {
  targetRole: string;
  fileName?: string | null;
  inputMethod?: "text" | "file";
  atsScore: number;
  wordCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  detectedSections: string[];
  missingSections: string[];
  strengths: string[];
  suggestions: string[];
};

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] =
    useState<File | null>(null);
  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!file) {
      return;
    }

    const extension =
      file.name.toLowerCase().split(".").pop() ?? "";

    if (!["pdf", "docx"].includes(extension)) {
      setResumeFile(null);
      setError(
        "Unsupported file type. Upload only a PDF or DOCX resume."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      setError("Resume file must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
    setResumeText("");
    event.target.value = "";
  }

  async function analyzeResume() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      let response: Response;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("resumeFile", resumeFile);

        response = await fetch("/api/resume-analysis", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/resume-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeText }),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to analyze resume."
        );
      }

      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    analysis && analysis.atsScore >= 75
      ? "text-emerald-300"
      : analysis && analysis.atsScore >= 50
        ? "text-cyan-300"
        : "text-amber-300";

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
          src="/videos/resume-ats-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.68),rgba(5,8,22,0.84)),radial-gradient(circle_at_top_right,rgba(76,29,149,0.14),transparent_42%)]"
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <FileSearch className="text-cyan-300" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Resume Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Target-Role ATS Analyzer
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Upload your PDF or DOCX resume for automatic text
            extraction, ATS scoring, keyword alignment and
            role-specific improvements.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="sr-only"
            />

            <label
              htmlFor="resume-file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.05] px-6 py-9 text-center transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.09]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Upload
                  size={26}
                  className="text-cyan-300"
                />
              </span>

              <span className="mt-4 font-semibold text-white">
                {resumeFile
                  ? "Choose a different resume"
                  : "Upload your resume"}
              </span>

              <span className="mt-2 text-sm text-slate-400">
                PDF or DOCX · Maximum 5 MB
              </span>
            </label>

            {resumeFile && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
                <FileText
                  size={22}
                  className="shrink-0 text-emerald-300"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-emerald-100">
                    {resumeFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Remove selected resume"
                  onClick={() => {
                    setResumeFile(null);
                    setAnalysis(null);
                    setError("");
                  }}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Or paste resume text
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <label className="text-sm font-semibold text-slate-200">
              Resume content
            </label>

            <textarea
              value={resumeText}
              disabled={Boolean(resumeFile)}
              onChange={(event) =>
                setResumeText(event.target.value)
              }
              rows={22}
              placeholder="Paste the complete text from your resume here..."
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Minimum 150 characters</span>
              <span>{resumeText.length} characters</span>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={analyzeResume}
              disabled={loading || (!resumeFile && resumeText.length < 150)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Sparkles size={18} />
              )}

              {loading
                ? resumeFile
                  ? "Reading and analyzing resume..."
                  : "Analyzing resume..."
                : resumeFile
                  ? "Analyze Uploaded Resume"
                  : "Analyze My Resume"}
            </button>
          </div>

          <div>
            {!analysis ? (
              <div className="grid min-h-[500px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <div>
                  <Target
                    size={40}
                    className="relative z-10 mx-auto text-slate-600"
                  />

                  <h2 className="mt-4 text-xl font-semibold">
                    Your intelligence report will appear here
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    CareerIntel evaluates structure, role
                    keywords, measurable impact and portfolio
                    evidence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl border border-violet-400/20 bg-violet-400/[0.06] p-6">
                  <p className="text-sm text-slate-400">
                    ATS Compatibility Score
                  </p>

                  <div className="mt-2 flex items-end justify-between">
                    <p
                      className={`text-5xl font-bold ${scoreColor}`}
                    >
                      {analysis.atsScore}%
                    </p>

                    <p className="text-sm text-slate-400">
                      {analysis.wordCount} words
                    </p>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                      style={{
                        width: `${analysis.atsScore}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-cyan-200">
                    Target: {analysis.targetRole}
                  </p>

                  {analysis.fileName && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      Resume: {analysis.fileName}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ReportCard
                    title="Matched Keywords"
                    items={analysis.matchedKeywords}
                    positive
                  />

                  <ReportCard
                    title="Missing Keywords"
                    items={analysis.missingKeywords}
                  />
                </div>

                <ReportCard
                  title="Resume Strengths"
                  items={analysis.strengths}
                  positive
                />

                <ReportCard
                  title="Priority Improvements"
                  items={analysis.suggestions}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ReportCard({
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
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 text-sm leading-5 text-slate-300"
            >
              {positive ? (
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />
              ) : (
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-300"
                />
              )}

              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No issues detected.
          </p>
        )}
      </div>
    </div>
  );
}