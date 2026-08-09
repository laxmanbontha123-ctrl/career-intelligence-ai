"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

type Message = {
  id: number | string;
  role: string;
  content: string;
  createdAt: string;
};

const suggestions = [
  "What should I learn this week?",
  "How can I improve my career readiness?",
  "Suggest a project for my target role.",
  "How can I improve my resume?",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/mentor");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load conversation."
          );
        }

        setMessages(data.messages);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load conversation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const question = input.trim();

    if (!question || sending) return;

    const optimisticMessage: Message = {
      id: `temporary-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI mentor is unavailable."
        );
      }

      setMessages((current) => [
        ...current.filter(
          (message) =>
            message.id !== optimisticMessage.id
        ),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (err) {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== optimisticMessage.id
        )
      );

      setInput(question);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact AI mentor."
      );
    } finally {
      setSending(false);
    }
  }

  async function clearConversation() {
    if (
      !window.confirm(
        "Clear your complete mentor conversation?"
      )
    ) {
      return;
    }

    const response = await fetch("/api/mentor", {
      method: "DELETE",
    });

    if (response.ok) {
      setMessages([]);
      setError("");
    }
  }

  return (
    <main className="overflow-hidden relative min-h-screen bg-[#050816] px-4 py-6 text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.18]"
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
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.78),rgba(5,8,22,0.9)),radial-gradient(circle_at_top_right,rgba(76,29,149,0.14),transparent_42%)]"
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
              <Bot size={23} />
            </div>

            <div>
              <h1 className="font-bold">
                CareerIntel AI Mentor
              </h1>

              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Personalized mentor online
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:text-red-300"
              title="Clear conversation"
            >
              <Trash2 size={17} />
            </button>
          )}
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {loading ? (
            <div className="grid h-full place-items-center">
              <Loader2 className="animate-spin text-cyan-300" />
            </div>
          ) : messages.length === 0 ? (
            <div className="relative z-10 mx-auto max-w-2xl py-12 text-center">
              <div className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-violet-400/20 bg-violet-400/10">
                <Sparkles className="text-violet-300" />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                How can I guide your career today?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                I understand your learner profile, target role,
                skill gaps, readiness score and resume analysis.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto max-w-3xl space-y-5">
              {messages.map((message) => {
                const assistant =
                  message.role === "assistant";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      assistant
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    {assistant && (
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        assistant
                          ? "border border-white/10 bg-white/[0.05] text-slate-200"
                          : "whitespace-pre-wrap bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                      }`}
                    >
                      {assistant ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="mb-3 mt-5 text-xl font-bold text-white first:mt-0">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-2 mt-5 text-lg font-bold text-cyan-100 first:mt-0">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-2 mt-4 font-bold text-cyan-200 first:mt-0">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-3 ml-5 list-disc space-y-1 marker:text-cyan-300">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-3 ml-5 list-decimal space-y-2 marker:font-semibold marker:text-violet-300">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="pl-1">
                                {children}
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">
                                {children}
                              </strong>
                            ),
                            code: ({ children }) => (
                              <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-cyan-200">
                                {children}
                              </code>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-300 underline underline-offset-2"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>

                    {!assistant && (
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                        <User size={17} />
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
                    <Bot size={18} />
                  </div>

                  <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-2 w-2 animate-pulse rounded-full bg-cyan-300"
                        style={{
                          animationDelay: `${dot * 150}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 p-4 sm:p-5">
          {error && (
            <div className="relative z-10 mx-auto mb-3 max-w-3xl rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="relative z-10 mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-2 focus-within:border-cyan-400/30"
          >
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Ask about skills, projects, resume or career..."
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600"
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 transition hover:brightness-110 disabled:opacity-40"
            >
              {sending ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-[11px] text-slate-600">
            AI guidance may contain mistakes. Verify important
            career decisions and current opportunities.
          </p>
        </footer>
      </div>
    </main>
  );
}