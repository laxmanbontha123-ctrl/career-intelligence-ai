"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type LearnerProfile = {
  institution: string | null;
  degree: string | null;
  branch: string | null;
  currentYear: number | null;
  cgpa: number | null;
  graduationYear: number | null;
  experienceLevel: string | null;
  preferredWorkMode: string | null;
  location: string | null;
  contactPhone: string | null;
  bio: string | null;
};

type Profile = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  authMethod: string | null;
  avatarDataUrl: string | null;
  targetRole: string | null;
  readinessScore: number;
  profileCompleted: boolean;
  learnerProfile: LearnerProfile | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  profile?: Profile;
};

type FormState = {
  name: string;
  avatarDataUrl: string | null;
  institution: string;
  degree: string;
  branch: string;
  currentYear: string;
  cgpa: string;
  graduationYear: string;
  experienceLevel: string;
  preferredWorkMode: string;
  location: string;
  contactPhone: string;
  bio: string;
  targetRole: string;
};

const initialForm: FormState = {
  name: "",
  avatarDataUrl: null,
  institution: "",
  degree: "",
  branch: "",
  currentYear: "",
  cgpa: "",
  graduationYear: "",
  experienceLevel: "",
  preferredWorkMode: "",
  location: "",
  contactPhone: "",
  bio: "",
  targetRole: "",
};

const targetRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI / ML Engineer",
  "Data Analyst",
  "Data Scientist",
  "Cloud / DevOps Engineer",
  "Cybersecurity Engineer",
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-cyan-400/[0.04]";

function toIndianLocalNumber(
  value: string | null | undefined
) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits.slice(2);
  }

  return digits.slice(0, 10);
}

function dataUrlSize(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = base64.match(/=*$/)?.[0].length ?? 0;

  return Math.floor((base64.length * 3) / 4) - padding;
}

async function compressAvatar(file: File) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Choose a PNG, JPEG or WebP image.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Original image must be smaller than 8 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new window.Image();
    image.decoding = "async";
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Unable to read this image."));
    });

    function render(maxDimension: number, quality: number) {
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height)
      );

      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare profile image.");
      }

      context.drawImage(image, 0, 0, width, height);

      return canvas.toDataURL("image/webp", quality);
    }

    let avatar = render(512, 0.84);

    for (
      let quality = 0.72;
      dataUrlSize(avatar) > 680 * 1024 && quality >= 0.42;
      quality -= 0.1
    ) {
      avatar = render(512, quality);
    }

    if (dataUrlSize(avatar) > 680 * 1024) {
      avatar = render(320, 0.68);
    }

    if (dataUrlSize(avatar) > 700 * 1024) {
      throw new Error(
        "Unable to compress this image below 700 KB. Try another image."
      );
    }

    return avatar;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      message: "Server returned an empty response.",
    } satisfies ApiResponse;
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return {
      success: false,
      message: "Server returned an invalid response.",
    } satisfies ApiResponse;
  }
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      const result = await readResponse(response);

      if (!response.ok || !result.success || !result.profile) {
        throw new Error(
          result.message ?? "Unable to load your profile."
        );
      }

      const loadedProfile = result.profile;
      const learner = loadedProfile.learnerProfile;

      setProfile(loadedProfile);
      setForm({
        name: loadedProfile.name ?? "",
        avatarDataUrl: loadedProfile.avatarDataUrl,
        institution: learner?.institution ?? "",
        degree: learner?.degree ?? "",
        branch: learner?.branch ?? "",
        currentYear:
          learner?.currentYear?.toString() ?? "",
        cgpa: learner?.cgpa?.toString() ?? "",
        graduationYear:
          learner?.graduationYear?.toString() ?? "",
        experienceLevel:
          learner?.experienceLevel ?? "",
        preferredWorkMode:
          learner?.preferredWorkMode ?? "",
        location: learner?.location ?? "",
        contactPhone: toIndianLocalNumber(
          learner?.contactPhone ??
            loadedProfile.phone
        ),
        bio: learner?.bio ?? "",
        targetRole: loadedProfile.targetRole ?? "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function updateField(
    field: keyof FormState,
    value: string | null
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
  }

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setProcessingImage(true);
      setError("");
      setSuccess("");

      const avatarDataUrl = await compressAvatar(file);

      setForm((current) => ({
        ...current,
        avatarDataUrl,
      }));
    } catch (imageError) {
      setError(
        imageError instanceof Error
          ? imageError.message
          : "Unable to process profile image."
      );
    } finally {
      setProcessingImage(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await readResponse(response);

      if (!response.ok || !result.success || !result.profile) {
        throw new Error(
          result.message ?? "Unable to update your profile."
        );
      }

      setProfile(result.profile);
      setSuccess(
        result.message ?? "Profile updated successfully."
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  const initials = (form.name || profile?.email || "CI")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-cyan-300" />
          <p className="mt-4 text-sm text-slate-400">
            Loading your CareerIntel profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-white">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30"
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
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.72),rgba(5,8,22,0.93)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_38%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Learner identity
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Your CareerIntel Profile
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Keep your academic and career information accurate.
            </p>
          </div>

          <button
            type="submit"
            form="profile-form"
            disabled={saving || processingImage}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save profile"}
          </button>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-400/[0.09] px-5 py-4 text-sm text-rose-200 backdrop-blur-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.09] px-5 py-4 text-sm text-emerald-200 backdrop-blur-xl">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <form
          id="profile-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 lg:grid-cols-[330px_1fr]"
        >
          <aside className="h-fit rounded-3xl border border-cyan-400/20 bg-[#081126]/60 p-6 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl lg:sticky lg:top-8">
            <div className="relative mx-auto h-36 w-36">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/40 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-4xl font-black text-cyan-100 shadow-xl shadow-cyan-950/30">
                {form.avatarDataUrl ? (
                  <img
                    src={form.avatarDataUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || <UserRound size={44} />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingImage}
                className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300 text-slate-950 shadow-lg transition hover:scale-105 disabled:cursor-wait"
                aria-label="Upload profile image"
              >
                {processingImage ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              {form.name || "CareerIntel Learner"}
            </h2>

            <p className="mt-1 text-sm text-cyan-200">
              {form.targetRole || "Choose your target career"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              PNG, JPEG or WebP. Securely compressed below 700 KB.
            </p>

            {form.avatarDataUrl && (
              <button
                type="button"
                onClick={() =>
                  updateField("avatarDataUrl", null)
                }
                className="mx-auto mt-4 inline-flex items-center gap-2 text-xs font-semibold text-rose-300 transition hover:text-rose-200"
              >
                <Trash2 size={14} />
                Remove photo
              </button>
            )}

            <div className="mt-7 rounded-2xl border border-violet-400/20 bg-violet-400/[0.08] p-5 text-left">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Target size={16} />
                Career readiness
              </div>

              <p className="mt-2 text-3xl font-black text-violet-300">
                {profile?.readinessScore ?? 0}%
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  style={{
                    width: `${profile?.readinessScore ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#081126]/60 p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <UserRound className="text-cyan-300" />
                <div>
                  <h2 className="text-xl font-bold">
                    Personal information
                  </h2>
                  <p className="text-sm text-slate-400">
                    Your learner identity and contact information.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Full name
                  <input
                    required
                    minLength={2}
                    maxLength={80}
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Enter your full name"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Location
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={form.location}
                      onChange={(event) =>
                        updateField(
                          "location",
                          event.target.value
                        )
                      }
                      className={`${fieldClass} pl-11`}
                      placeholder="Hyderabad, Telangana"
                    />
                  </div>
                </label>

                <label className="text-sm text-slate-300">
                  Email address
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={profile?.email ?? ""}
                      readOnly
                      className={`${fieldClass} cursor-not-allowed pl-11 opacity-65`}
                    />
                  </div>
                </label>

                <label className="text-sm text-slate-300">
                  Contact phone number

                  <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black/20 transition focus-within:border-cyan-400/40 focus-within:bg-cyan-400/[0.04]">
                    <span className="flex items-center border-r border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-cyan-200">
                      +91
                    </span>

                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      value={form.contactPhone}
                      onChange={(event) => {
                        const digits =
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                        updateField(
                          "contactPhone",
                          digits
                        );
                      }}
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                      placeholder="9876543210"
                    />
                  </div>

                  <div className="mt-2 flex justify-between gap-3 text-xs text-slate-500">
                    <span>
                      Indian mobile number for reminders.
                    </span>

                    <span
                      className={
                        form.contactPhone.length === 10
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }
                    >
                      {form.contactPhone.length}/10
                    </span>
                  </div>
                </label>
              </div>

              <label className="mt-5 block text-sm text-slate-300">
                Professional bio
                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  rows={4}
                  maxLength={800}
                  className={`${fieldClass} resize-y`}
                  placeholder="Describe your interests, strengths and career goals."
                />
              </label>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#081126]/60 p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-cyan-300" />
                <div>
                  <h2 className="text-xl font-bold">
                    Academic information
                  </h2>
                  <p className="text-sm text-slate-400">
                    Used to personalize your academic missions.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-slate-300 md:col-span-2">
                  Institution
                  <input
                    required
                    value={form.institution}
                    onChange={(event) =>
                      updateField(
                        "institution",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                    placeholder="Institution name"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Degree
                  <input
                    required
                    value={form.degree}
                    onChange={(event) =>
                      updateField("degree", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="B.Tech"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Branch
                  <input
                    required
                    value={form.branch}
                    onChange={(event) =>
                      updateField("branch", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Computer Science and Engineering"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Current year
                  <select
                    required
                    value={form.currentYear}
                    onChange={(event) =>
                      updateField(
                        "currentYear",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  CGPA
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={form.cgpa}
                    onChange={(event) =>
                      updateField("cgpa", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="8.50"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Graduation year
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.graduationYear}
                    onChange={(event) =>
                      updateField(
                        "graduationYear",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                    placeholder="2027"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Experience level
                  <select
                    value={form.experienceLevel}
                    onChange={(event) =>
                      updateField(
                        "experienceLevel",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="">Select experience</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">
                      Intermediate
                    </option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#081126]/60 p-6 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="text-violet-300" />
                <div>
                  <h2 className="text-xl font-bold">
                    Career preferences
                  </h2>
                  <p className="text-sm text-slate-400">
                    Controls your skill gaps, roadmap and AI Tutor.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Target career
                  <select
                    required
                    value={form.targetRole}
                    onChange={(event) =>
                      updateField(
                        "targetRole",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="">Select target role</option>
                    {targetRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  Preferred work mode
                  <select
                    value={form.preferredWorkMode}
                    onChange={(event) =>
                      updateField(
                        "preferredWorkMode",
                        event.target.value
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="">Select work mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving || processingImage}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-6 py-4 font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving profile..." : "Save all changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
