"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FlaskConical,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type QuizQuestion = {
  question: string;
  options: string[];
};

type MissionData = {
  success: boolean;
  message?: string;
  locked?: boolean;
  mission: {
    id: number;
    category: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    requiredScore: number;
    bestScore: number;
    completed: boolean;
    verifiedAt: string | null;
  };
  content: {
    lessonTitle: string;
    objectives: string[];
    lessonMarkdown: string;
    practiceMarkdown: string;
    sources: string[];
    quiz: QuizQuestion[];
  };
  attempts: Array<{
    id: number;
    score: number;
    passed: boolean;
    feedback: string;
    createdAt: string;
  }>;
};

type VerificationResult = {
  success: boolean;
  message?: string;
  score?: number;
  passed?: boolean;
  requiredScore?: number;
  bestScore?: number;
  feedback?: string;
  correctCount?: number;
  totalQuestions?: number;
  improvementTips?: string[];
  questionResults?: Array<{
    questionNumber: number;
    question: string;
    selectedAnswer: number;
    selectedOption: string;
    correctAnswer: number;
    correctOption: string;
    correct: boolean;
    explanation: string;
  }>;
};

function enhanceGeneratedMarkdown(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(
      /^[ \t]*(?:[-*+]\s+)?(?:\*\*)?Command:(?:\*\*)?[ \t]+`?(.+?)`?[ \t]*$/gim,
      (_match, command: string) =>
        `\n\`\`\`bash\n${command.trim()}\n\`\`\`\n`
    )
    .replace(
      /^[ \t]*(?:[-*+]\s+)?(?:\*\*)?Expected Output:(?:\*\*)?[ \t]*(.+)$/gim,
      (_match, output: string) =>
        `\n**Expected output:** ${output.trim()}\n`
    )
    .replace(
      /^[ \t]*[-*+]\s+\[\s*\]\s+/gm,
      "- \u2610 "
    )
    .replace(
      /^[ \t]*[-*+]\s+\[\s*[xX]\s*\]\s+/gm,
      "- \u2611 "
    );
}

function CopyableCodeBlock({
  children,
}: {
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const codeElement =
    isValidElement<{ children?: ReactNode }>(children)
      ? children
      : null;

  const code = String(
    codeElement?.props.children ?? children ?? ""
  ).replace(/\n$/, "");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  }

  const displayCode = code.replace(/\\n/g, "\n");
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#020617]/65 shadow-lg backdrop-blur-xl shadow-cyan-950/20">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
          Terminal command
        </span>

        <button
          type="button"
          onClick={() => void copyCode()}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] [&_code]:whitespace-pre-wrap [&_code]:break-words p-4 text-sm leading-6 text-cyan-100">
            <code>{displayCode}</code>
          </pre>
    </div>
  );
}

function MarkdownContent({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h2 className="mt-8 text-2xl font-bold text-white">
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 text-xl font-bold text-white">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 text-lg font-semibold text-cyan-100">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-3 leading-7 text-slate-300">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="ml-6 mt-3 list-disc space-y-2 text-slate-300 marker:text-cyan-400">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="ml-6 mt-3 list-decimal space-y-3 text-slate-300 marker:font-bold marker:text-violet-300">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1 leading-7">{children}</li>
        ),
        code: ({ children, className }) => (
          <code
            className={
              className
                ? `font-mono text-sm text-cyan-100 ${className}`
                : "rounded-md border border-white/10 bg-black/40 px-1.5 py-1 font-mono text-sm text-cyan-200"
            }
          >
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <CopyableCodeBlock>{children}</CopyableCodeBlock>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 rounded-r-xl border-l-4 border-cyan-400 bg-cyan-400/[0.06] px-5 py-3 text-slate-300">
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className="my-7 border-white/10" />
        ),
      }}
    >
      {enhanceGeneratedMarkdown(content)}
    </ReactMarkdown>
  );
}

function TutorBackground() {
  return (
    <>
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/mentor-ai-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.64),rgba(5,8,22,0.90)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_46%)]"
      />
    </>
  );
}
export default function LearningMissionPage() {
  const params = useParams<{
    missionId: string;
  }>();

  const missionId = params.missionId;
  const missionRequestRef =
    useRef<string | null>(null);

  const [data, setData] =
    useState<MissionData | null>(null);
  const [answers, setAnswers] = useState<
    Array<number | null>
  >([]);
  const [lessonStudied, setLessonStudied] =
    useState(false);
  const [practiceEvidence, setPracticeEvidence] =
    useState("");
  const [result, setResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  const loadMission = useCallback(async () => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 35000);

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/learning-mission/${missionId}`,
        {
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const responseText = await response.text();

      let payload: MissionData;

      try {
        payload = JSON.parse(responseText) as MissionData;
      } catch {
        throw new Error(
          "Tutor service returned an invalid response. Please refresh and try again."
        );
      }

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ||
            "Unable to load this mission."
        );
      }

      setData(payload);
      setAnswers(
        payload.content.quiz.map(() => null)
      );
    } catch (loadError) {
      const message =
        loadError instanceof DOMException &&
        loadError.name === "AbortError"
          ? "Tutor request timed out. Please refresh and try again."
          : loadError instanceof Error
            ? loadError.message
            : "Unable to load this mission.";

      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    if (
      missionRequestRef.current === missionId
    ) {
      return;
    }

    missionRequestRef.current = missionId;
    void loadMission();
  }, [loadMission, missionId]);

  const allQuestionsAnswered = useMemo(
    () =>
      answers.length > 0 &&
      answers.every((answer) => answer !== null),
    [answers]
  );

  const evidenceReady =
    practiceEvidence.trim().length >= 80;

  const quizUnlocked =
    lessonStudied && evidenceReady;

  function selectAnswer(
    questionIndex: number,
    optionIndex: number
  ) {
    setAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex
          ? optionIndex
          : answer
      )
    );
  }

  async function submitVerification() {
    if (!data || !quizUnlocked) {
      return;
    }

    if (!allQuestionsAnswered) {
      setError(
        "Answer every quiz question before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `/api/learning-mission/${missionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            practiceEvidence:
              practiceEvidence.trim(),
          }),
        }
      );

      const payload =
        (await response.json()) as VerificationResult;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ||
            "Unable to verify this mission."
        );
      }

      setResult(payload);

      if (payload.passed) {
        setData((current) =>
          current
            ? {
                ...current,
                mission: {
                  ...current.mission,
                  completed: true,
                  bestScore:
                    payload.bestScore ??
                    payload.score ??
                    current.mission.bestScore,
                },
              }
            : current
        );
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to verify this mission."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-5 text-white">
        <TutorBackground />

        <div className="relative z-10 max-w-md rounded-3xl border border-cyan-400/20 bg-[#071022]/60 p-8 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-500/10">
            <Loader2 className="animate-spin text-cyan-300" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            CareerIntel AI Tutor is preparing your lesson
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Your personalized lesson, practical task and
            verification quiz are being generated.
          </p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-5 text-white">
        <TutorBackground />

        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-rose-400/25 bg-[#130b18]/65 p-8 text-center shadow-2xl shadow-rose-950/20 backdrop-blur-xl">
          <LockKeyhole className="mx-auto text-rose-300" />

          <h1 className="mt-5 text-2xl font-bold">
            Mission unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-rose-100/80">
            {error}
          </p>

          <Link
            href="/dashboard"
            className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold"
          >
            <ChevronLeft size={17} />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-white">
      <TutorBackground />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ChevronLeft size={18} />
          Back to dashboard
        </Link>

        <header className="mt-7 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#081126]/55 backdrop-blur-2xl ring-1 ring-white/[0.03] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                <Sparkles size={15} />
                Verified AI Learning Mission
              </div>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                {data.content.lessonTitle}
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                {data.mission.description}
              </p>
            </div>

            <div className="flex shrink-0 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock3 size={16} />
                  {data.mission.estimatedMinutes} min
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.08] px-4 py-3">
                <p className="text-xs text-slate-400">
                  Pass score
                </p>
                <p className="mt-1 font-bold text-violet-200">
                  {data.mission.requiredScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Learn",
                ready: lessonStudied,
              },
              {
                label: "Practice",
                ready: evidenceReady,
              },
              {
                label: "Verify",
                ready: Boolean(result?.passed),
              },
            ].map((step, index) => (
              <div
                key={step.label}
                className={`rounded-xl border px-4 py-3 ${
                  step.ready
                    ? "border-emerald-400/25 bg-emerald-400/[0.08]"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <p className="text-xs text-slate-500">
                  Step {index + 1}
                </p>
                <p className="mt-1 flex items-center gap-2 font-semibold">
                  {step.ready ? (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-300"
                    />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[9px] text-slate-400">
                      {index + 1}
                    </span>
                  )}
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#081126]/55 backdrop-blur-2xl ring-1 ring-white/[0.03] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <BookOpen />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Step 1 - Learn
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Master the fundamentals
              </h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
            <h3 className="font-semibold text-cyan-100">
              Learning objectives
            </h3>

            <ul className="mt-4 space-y-3">
              {data.content.objectives.map(
                (objective) => (
                  <li
                    key={objective}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-cyan-300"
                    />
                    {objective}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="mt-7 space-y-4 leading-7 text-slate-300">
            <MarkdownContent
              content={data.content.lessonMarkdown}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setLessonStudied((current) => !current)
            }
            className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition ${
              lessonStudied
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
            }`}
          >
            {lessonStudied ? (
              <CheckCircle2 size={18} />
            ) : (
              <BookOpen size={18} />
            )}
            {lessonStudied
              ? "Lesson studied"
              : "I have studied this complete lesson"}
          </button>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#081126]/55 backdrop-blur-2xl ring-1 ring-white/[0.03] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <FlaskConical />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                Step 2 - Practice
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Complete the practical task
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 leading-7 text-slate-300">
            <MarkdownContent
              content={data.content.practiceMarkdown}
            />
          </div>

          <label className="mt-7 block">
            <span className="font-semibold text-white">
              Practical evidence
            </span>

            <span className="mt-1 block text-sm text-slate-400">
              Explain what you performed, commands or
              steps used, and the result you received.
            </span>

            <textarea
              value={practiceEvidence}
              onChange={(event) =>
                setPracticeEvidence(event.target.value)
              }
              rows={6}
              placeholder="Example: I created..., then executed..., the output confirmed..."
              className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40"
            />

            <span
              className={`mt-2 block text-xs ${
                evidenceReady
                  ? "text-emerald-300"
                  : "text-slate-500"
              }`}
            >
              {practiceEvidence.trim().length}/80
              minimum characters
            </span>
          </label>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#081126]/55 backdrop-blur-2xl ring-1 ring-white/[0.03] p-6 md:p-8">
          {!quizUnlocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#050816]/85 p-6 backdrop-blur-sm">
              <div className="max-w-md text-center">
                <LockKeyhole className="mx-auto text-violet-300" />

                <h2 className="mt-4 text-xl font-bold">
                  Verification quiz locked
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Study the full lesson and submit at least
                  80 characters of practical evidence to
                  unlock the quiz.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <ShieldCheck />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Step 3 - Verify
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Prove your understanding
              </h2>
            </div>
          </div>

          <div className="mt-7 space-y-6">
            {data.content.quiz.map(
              (question, questionIndex) => (
                <article
                  key={question.question}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <p className="font-semibold leading-7">
                    {questionIndex + 1}.{" "}
                    {question.question}
                  </p>

                  <div className="mt-4 grid gap-3">
                    {question.options.map(
                      (option, optionIndex) => {
                        const selected =
                          answers[questionIndex] ===
                          optionIndex;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                questionIndex,
                                optionIndex
                              )
                            }
                            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                              selected
                                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                            }`}
                          >
                            <span className="mr-3 font-semibold">
                              {String.fromCharCode(
                                65 + optionIndex
                              )}.
                            </span>
                            {option}
                          </button>
                        );
                      }
                    )}
                  </div>
                </article>
              )
            )}
          </div>

          <button
            type="button"
            disabled={
              submitting ||
              !quizUnlocked ||
              !allQuestionsAnswered
            }
            onClick={() =>
              void submitVerification()
            }
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />
                Verifying your knowledge...
              </>
            ) : (
              <>
                <Send size={19} />
                Submit for AI verification
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] p-4 text-sm text-rose-200">
              {error}
            </p>
          )}

          {result && (
            <div
              className={`mt-6 overflow-hidden rounded-3xl border p-6 backdrop-blur-2xl ${
                result.passed
                  ? "border-emerald-400/30 bg-emerald-400/[0.09]"
                  : "border-amber-400/30 bg-amber-400/[0.08]"
              }`}
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex items-start gap-4">
                  {result.passed ? (
                    <Trophy className="shrink-0 text-emerald-300" />
                  ) : (
                    <RotateCcw className="shrink-0 text-amber-300" />
                  )}

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Verification report
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                      {result.passed
                        ? "Mission verified"
                        : "Keep learning and retry"}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {result.feedback}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-center">
                  <p className="text-4xl font-black">
                    {result.score ?? 0}%
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {result.correctCount ?? 0} of{" "}
                    {result.totalQuestions ??
                      data.content.quiz.length}{" "}
                    correct
                  </p>
                </div>
              </div>

              {result.questionResults &&
                result.questionResults.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-bold">
                      Question-by-question review
                    </h4>

                    {result.questionResults.map((item) => (
                      <article
                        key={`${item.questionNumber}-${item.question}`}
                        className={`rounded-2xl border p-5 ${
                          item.correct
                            ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                            : "border-rose-400/20 bg-rose-400/[0.06]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-semibold">
                            {item.questionNumber}.{" "}
                            {item.question}
                          </p>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
                              item.correct
                                ? "border-emerald-400/30 text-emerald-300"
                                : "border-rose-400/30 text-rose-300"
                            }`}
                          >
                            {item.correct
                              ? "Correct"
                              : "Incorrect"}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Your answer
                            </p>

                            <p
                              className={`mt-2 text-sm ${
                                item.correct
                                  ? "text-emerald-200"
                                  : "text-rose-200"
                              }`}
                            >
                              {item.selectedOption}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Correct answer
                            </p>

                            <p className="mt-2 text-sm text-emerald-200">
                              {item.correctOption}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                          <span className="font-semibold text-cyan-200">
                            Explanation:{" "}
                          </span>
                          {item.explanation}
                        </p>
                      </article>
                    ))}
                  </div>
                )}

              {!result.passed &&
                result.improvementTips &&
                result.improvementTips.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-amber-400/20 bg-black/20 p-5">
                    <h4 className="font-bold text-amber-200">
                      Your improvement plan
                    </h4>

                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                      {result.improvementTips.map(
                        (tip, index) => (
                          <li
                            key={`${index}-${tip}`}
                            className="flex gap-2"
                          >
                            <span className="text-amber-300">
                              {index + 1}.
                            </span>
                            <span>{tip}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 font-bold text-amber-100 transition hover:bg-amber-400/15"
                    >
                      <RotateCcw size={17} />
                      Review answers and retry
                    </button>
                  </div>
                )}

              {result.passed && (
                <Link
                  href="/dashboard"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 font-bold text-slate-950"
                >
                  Continue to next mission
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          )}
        </section>

        {data.content.sources.length > 0 && (
          <section className="my-6 rounded-3xl border border-white/10 bg-[#081126]/55 backdrop-blur-2xl ring-1 ring-white/[0.03] p-6">
            <h2 className="font-semibold">
              Trusted learning sources
            </h2>

            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {data.content.sources.map(
                (source) => (
                  <li key={source}>• {source}</li>
                )
              )}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
