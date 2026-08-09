"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { auth } from "@/lib/firebase";

export default function PhoneRegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const confirmationRef =
    useRef<ConfirmationResult | null>(null);

  const recaptchaRef =
    useRef<RecaptchaVerifier | null>(null);

  function resetRecaptcha() {
    try {
      recaptchaRef.current?.clear();
    } catch {}

    recaptchaRef.current = null;

    const container =
      document.getElementById("recaptcha-container");

    if (container) {
      container.innerHTML = "";
    }
  }

  function getRecaptchaVerifier() {
    if (recaptchaRef.current) {
      return recaptchaRef.current;
    }

    const container =
      document.getElementById("recaptcha-container");

    if (!container) {
      throw new Error(
        "Security verification container is unavailable."
      );
    }

    container.innerHTML = "";

    const verifier = new RecaptchaVerifier(
      auth,
      container,
      {
        size: "invisible",
      }
    );

    recaptchaRef.current = verifier;

    return verifier;
  }

  async function handleSendOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      setError(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    try {
      setLoading(true);

      // DEVELOPMENT ONLY:
      // Firebase fictional/test numbers can use mock reCAPTCHA.
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        auth.settings.appVerificationDisabledForTesting =
          true;
      }

      resetRecaptcha();

      const verifier = getRecaptchaVerifier();

      const result = await signInWithPhoneNumber(
        auth,
        `+91${cleanPhone}`,
        verifier
      );

      confirmationRef.current = result;

      setOtpSent(true);
      setMessage(
        "OTP sent successfully. Enter the 6-digit code."
      );
    } catch (err) {
      console.error("Phone OTP send error:", err);

      resetRecaptcha();

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    if (!confirmationRef.current) {
      setError("Please request a new OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("Enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const credential =
        await confirmationRef.current.confirm(otp);

      const idToken =
        await credential.user.getIdToken(true);

      const response = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "Unable to verify Phone authentication."
        );
      }

      resetRecaptcha();

      router.push("/dashboard");
    } catch (err) {
      console.error(
        "Phone OTP verification error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    resetRecaptcha();

    confirmationRef.current = null;

    setOtpSent(false);
    setOtp("");
    setError("");
    setMessage("");
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

      <section className="auth-left">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">
            <GraduationCap size={22} />
          </span>

          <span>
            Career
            <span className="brand-accent">
              Intel
            </span>
          </span>
        </Link>

        <div className="auth-intro">
          <div className="eyebrow">
            <ShieldCheck size={15} />
            SECURE PHONE VERIFICATION
          </div>

          <h1>
            Your career journey starts with
            <span> one secure code.</span>
          </h1>

          <p>
            Verify your mobile number using a 6-digit OTP
            and create your passwordless learner identity.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">
          <Link
            href="/register"
            className="auth-back-link"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="auth-card-heading">
            <span>PHONE OTP</span>

            <h2>Verify your mobile.</h2>

            <p>
              Enter your mobile number and continue with
              secure passwordless verification.
            </p>
          </div>

          {!otpSent ? (
            <form
              className="otp-form"
              onSubmit={handleSendOtp}
            >
              <label>
                Mobile number

                <div className="auth-input-wrap">
                  <Phone size={17} />

                  <span className="country-code">
                    +91
                  </span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    autoFocus
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>
              </label>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>
          ) : (
            <form
              className="otp-form"
              onSubmit={handleVerifyOtp}
            >
              <label>
                6-digit OTP

                <div className="auth-input-wrap otp-input-wrap">
                  <ShieldCheck size={17} />

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>
              </label>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Continue"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

              <button
                className="otp-change-number"
                type="button"
                onClick={handleChangeNumber}
              >
                Change mobile number
              </button>
            </form>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div
            id="recaptcha-container"
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              overflow: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      </section>
    </main>
  );
}