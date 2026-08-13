"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function EmailRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "verified">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send verification code.");
      }

      setStep("otp");
      setMessage("Verification code sent to your email.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify code.");
      }

      setStep("verified");
      setMessage("Email verified successfully.");

      setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify code."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      >
        <source src="/videos/register-background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.18),transparent_32%),linear-gradient(to_bottom,rgba(2,6,23,0.72),rgba(2,6,23,0.94))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link
            href="/register"
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to registration
          </Link>

          <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:p-9">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                {step === "verified" ? (
                  <CheckCircle2 className="text-emerald-300" size={24} />
                ) : (
                  <Mail className="text-cyan-300" size={24} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  CareerIntel AI
                </p>
                <h1 className="text-2xl font-semibold">
                  {step === "verified"
                    ? "Email verified"
                    : "Continue with Email"}
                </h1>
              </div>
            </div>

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}
                  {loading ? "Sending..." : "Send 6-digit code"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] p-4 text-sm text-slate-300">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-medium text-cyan-300">{email}</span>.
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Verification code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  className="w-full text-sm text-slate-400 transition hover:text-cyan-300"
                >
                  Use a different email
                </button>
              </form>
            )}

            {step === "verified" && (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                  <CheckCircle2 size={32} className="text-emerald-300" />
                </div>

                <h2 className="text-xl font-semibold">
                  Verification successful
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your email identity has been verified securely.
                </p>
              </div>
            )}

            {message && step !== "verified" && (
              <p className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <p className="mt-7 text-center text-xs leading-5 text-slate-500">
              Passwordless authentication &bull; OTP expires in 10 minutes
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
