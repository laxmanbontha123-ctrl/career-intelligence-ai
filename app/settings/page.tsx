"use client";

import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Loader2,
  Mail,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type UserSettings = {
  timezone: string;
  dailyGoalMinutes: number;
  reminderEnabled: boolean;
  reminderTime: string;
  emailNotifications: boolean;
  weeklyProgressEmail: boolean;
  reducedMotion: boolean;
};

type SettingsResponse = {
  success: boolean;
  message?: string;
  settings?: UserSettings;
};

const DEFAULT_SETTINGS: UserSettings = {
  timezone: "Asia/Kolkata",
  dailyGoalMinutes: 60,
  reminderEnabled: true,
  reminderTime: "19:00",
  emailNotifications: true,
  weeklyProgressEmail: true,
  reducedMotion: false,
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
        checked
          ? "border-cyan-300/60 bg-cyan-300"
          : "border-white/15 bg-white/10"
      }`}
    >
      <span
        className={`absolute top-1 h-[18px] w-[18px] rounded-full shadow-sm transition ${
          checked
            ? "left-[25px] bg-slate-950"
            : "left-1 bg-slate-400"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings", {
        cache: "no-store",
      });

      const result =
        (await response.json()) as SettingsResponse;

      if (response.status === 401) {
        router.replace("/register");
        return;
      }

      if (
        !response.ok ||
        !result.success ||
        !result.settings
      ) {
        throw new Error(
          result.message ?? "Unable to load settings."
        );
      }

      setSettings(result.settings);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateSetting<K extends keyof UserSettings>(
    field: K,
    value: UserSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result =
        (await response.json()) as SettingsResponse;

      if (
        !response.ok ||
        !result.success ||
        !result.settings
      ) {
        throw new Error(
          result.message ?? "Unable to save settings."
        );
      }

      setSettings(result.settings);
      setSuccess("Your preferences were saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-cyan-300" />
          <p className="mt-4 text-sm text-slate-400">
            Loading your preferences...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-25"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/dashboard-intelligence-background.mp4"
          type="video/mp4"
        />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.76),rgba(5,8,22,0.94)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_38%)]"
      />

      <form
        onSubmit={saveSettings}
        className="relative z-10 mx-auto max-w-5xl"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
          <ChevronLeft size={18} />
          Back to dashboard
        </Link>

        <header className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">
              Personal preferences
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              CareerIntel Settings
            </h1>

            <p className="mt-3 text-slate-400">
              Control your daily goals, reminders and learning
              experience.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save settings"}
          </button>
        </header>

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="mt-7 rounded-3xl border border-white/10 bg-[#081126]/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <CalendarClock className="text-cyan-300" />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Daily success plan
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Personalize the time allocated to your daily
                learning missions.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Daily learning goal
              <div className="relative mt-2">
                <Clock3
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  required
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={settings.dailyGoalMinutes}
                  onChange={(event) =>
                    updateSetting(
                      "dailyGoalMinutes",
                      Number(event.target.value)
                    )
                  }
                  className="h-14 w-full rounded-xl border border-white/10 bg-black/20 pl-12 pr-16 outline-none transition focus:border-cyan-400/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  minutes
                </span>
              </div>
            </label>

            <label className="text-sm text-slate-300">
              Timezone
              <select
                value={settings.timezone}
                onChange={(event) =>
                  updateSetting("timezone", event.target.value)
                }
                className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#071022] px-4 outline-none transition focus:border-cyan-400/50"
              >
                <option value="Asia/Kolkata">
                  India - Asia/Kolkata
                </option>
                <option value="UTC">UTC</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>
                <option value="Europe/London">
                  Europe/London
                </option>
                <option value="America/New_York">
                  America/New_York
                </option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#081126]/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Bell className="text-violet-300" />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Reminders and notifications
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Stay consistent without receiving unnecessary
                notifications.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Bell
                  size={19}
                  className="mt-0.5 text-cyan-300"
                />
                <div>
                  <p className="font-semibold">
                    Daily learning reminder
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Remind me to complete today's AI success plan.
                  </p>
                </div>
              </div>

              <Toggle
                label="Daily learning reminder"
                checked={settings.reminderEnabled}
                onChange={(checked) =>
                  updateSetting("reminderEnabled", checked)
                }
              />
            </div>

            {settings.reminderEnabled && (
              <label className="block rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] p-5 text-sm text-slate-300">
                Reminder time
                <input
                  required
                  type="time"
                  value={settings.reminderTime}
                  onChange={(event) =>
                    updateSetting(
                      "reminderTime",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#071022] px-4 outline-none focus:border-cyan-400/50 sm:max-w-xs"
                />
              </label>
            )}

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Mail
                  size={19}
                  className="mt-0.5 text-cyan-300"
                />
                <div>
                  <p className="font-semibold">
                    Email notifications
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Receive important CareerIntel updates.
                  </p>
                </div>
              </div>

              <Toggle
                label="Email notifications"
                checked={settings.emailNotifications}
                onChange={(checked) =>
                  updateSetting(
                    "emailNotifications",
                    checked
                  )
                }
              />
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={19}
                  className="mt-0.5 text-violet-300"
                />
                <div>
                  <p className="font-semibold">
                    Weekly progress summary
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Receive your readiness, mission and skill
                    progress report.
                  </p>
                </div>
              </div>

              <Toggle
                label="Weekly progress summary"
                checked={settings.weeklyProgressEmail}
                onChange={(checked) =>
                  updateSetting(
                    "weeklyProgressEmail",
                    checked
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#081126]/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <Settings2 className="text-emerald-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold">
                Accessibility
              </h2>

              <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">
                    Reduce animations
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Minimize cinematic movement for a calmer
                    experience.
                  </p>
                </div>

                <Toggle
                  label="Reduce animations"
                  checked={settings.reducedMotion}
                  onChange={(checked) =>
                    updateSetting("reducedMotion", checked)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 flex justify-end pb-8">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-7 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save all preferences"}
          </button>
        </div>
      </form>
    </main>
  );
}
