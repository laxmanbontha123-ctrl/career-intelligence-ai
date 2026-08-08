"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signInWithPopup } from "firebase/auth";


import {
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";

import {
  auth,
  googleProvider,
} from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleRegister() {
    setError("");

    try {
      setLoading(true);

      const credential =
        await signInWithPopup(auth, googleProvider);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authUid: credential.user.uid,
          name:
            credential.user.displayName ??
            "CareerIntel Learner",
          email: credential.user.email ?? "",
          phone: credential.user.phoneNumber ?? "",
          authMethod: "google",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "Unable to save Google user in MySQL."
        );
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Google sign-in error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <video
        className="auth-bg-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="/videos/register-background.mp4"
          type="video/mp4"
        />
      </video>

      <div className="auth-video-overlay" />
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-left">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">
            <GraduationCap size={22} />
          </span>

          <span>
            Career<span className="brand-accent">Intel</span>
          </span>
        </Link>

        <div className="auth-intro">
          <div className="eyebrow">
            <BrainCircuit size={15} />
            START YOUR CAREER INTELLIGENCE JOURNEY
          </div>

          <h1>
            Build a smarter path to
            <span> your target career.</span>
          </h1>

          <p>
            Create your secure learner identity and let
            CareerIntel understand your skills, goals and
            career journey.
          </p>

          <div className="auth-mini-card">
            <div>
              <span className="auth-mini-label">
                PASSWORDLESS ACCESS
              </span>

              <strong>
                Verify → Profile → Intelligence → Progress
              </strong>
            </div>

            <ArrowRight size={19} />
          </div>
        </div>

        <p className="auth-footer-text">
          Secure passwordless learner authentication.
        </p>
      </section>

      <section className="auth-right">
        <div className="auth-card">
          <div className="auth-card-heading">
            <span>CREATE ACCOUNT</span>

            <h2>Choose how to continue.</h2>

            <p>
              No passwords. Verify securely using Google,
              phone OTP or email OTP.
            </p>
          </div>

          <div className="passwordless-options">

            <button
              className="auth-method-btn"
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              <span className="auth-method-icon google-method">
                G
              </span>

              <span className="auth-method-copy">
                <strong>
                  {loading
                    ? "Connecting..."
                    : "Continue with Google"}
                </strong>
                <small>
                  Fast and secure Google authentication
                </small>
              </span>

              <ArrowRight size={18} />
            </button>

            <button
              className="auth-method-btn"
              type="button"
              onClick={() =>
                router.push("/register/phone")
              }
            >
              <span className="auth-method-icon">
                <Phone size={19} />
              </span>

              <span className="auth-method-copy">
                <strong>Continue with Phone OTP</strong>
                <small>
                  Receive a 6-digit verification code
                </small>
              </span>

              <ArrowRight size={18} />
            </button>

            <button
              className="auth-method-btn"
              type="button"
              onClick={() =>
                router.push("/register/email")
              }
            >
              <span className="auth-method-icon">
                <Mail size={19} />
              </span>

              <span className="auth-method-copy">
                <strong>Continue with Email OTP</strong>
                <small>
                  Verify using a secure 6-digit code
                </small>
              </span>

              <ArrowRight size={18} />
            </button>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="passwordless-note">
            <span>✓</span>
            No password required
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}