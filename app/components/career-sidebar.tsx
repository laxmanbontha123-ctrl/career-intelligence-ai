"use client";

import {
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck2,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Route,
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navigationGroups = [
  {
    label: "Career workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Daily AI Tutor",
        href: "/dashboard#daily-success-copilot",
        icon: CalendarCheck2,
      },
    ],
  },
  {
    label: "Career intelligence",
    items: [
      {
        label: "Skill Assessment",
        href: "/assessment",
        icon: ClipboardCheck,
      },
      {
        label: "Career Roadmap",
        href: "/roadmap",
        icon: Route,
      },
      {
        label: "Opportunities",
        href: "/opportunities",
        icon: BriefcaseBusiness,
      },
      {
        label: "Resume ATS",
        href: "/resume-analyzer",
        icon: FileSearch,
      },
    ],
  },
  {
    label: "AI coaching",
    items: [
      {
        label: "AI Career Mentor",
        href: "/mentor",
        icon: MessageSquareText,
      },
      {
        label: "Interview Coach",
        href: "/interview",
        icon: Bot,
      },
    ],
  },
];

function isCurrentRoute(pathname: string, href: string) {
  if (href.includes("#")) {
    return false;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function CareerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to log out."
        );
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const profileActive =
    pathname === "/profile" ||
    pathname.startsWith("/profile/");

  const adminMode = pathname.startsWith("/admin");

  const settingsActive =
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  return (
    <>
      <button
        type="button"
        aria-label="Open CareerIntel navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[70] flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[#081126]/90 text-cyan-200 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-cyan-400/10 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-950/75 transition duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="CareerIntel navigation"
        className={`fixed inset-y-0 left-0 z-[60] flex w-72 flex-col border-r border-cyan-400/15 bg-[#050b1c]/95 shadow-2xl shadow-black/40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
              <GraduationCap size={23} />
            </span>

            <span>
              <span className="block text-lg font-bold text-white">
                Career
                <span className="text-cyan-300">
                  Intel
                </span>
              </span>

              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                AI Success Platform
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          <div className={`mb-5 rounded-2xl border p-4 ${
            adminMode
              ? "border-violet-400/15 bg-violet-400/[0.06]"
              : "border-cyan-400/15 bg-cyan-400/[0.06]"
          }`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
              adminMode ? "text-violet-300" : "text-cyan-300"
            }`}>
              <BrainCircuit size={15} />
              {adminMode ? "Administrator intelligence" : "Student command center"}
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {adminMode
                ? "Monitor learner outcomes, engagement and career intelligence."
                : "Learn, practice, verify and become career-ready."}
            </p>
          </div>

          {adminMode ? (
            <nav className="space-y-2">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-400/10 px-3 py-3 text-sm font-semibold text-violet-200"
              >
                <BrainCircuit size={18} className="text-violet-300" />
                Administrator Intelligence
              </Link>
            </nav>
          ) : (
          <nav className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrentRoute(
                      pathname,
                      item.href
                    );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
                            : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={
                            active
                              ? "text-cyan-300"
                              : "text-slate-500"
                          }
                        />

                        {item.label}

                        {active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#050b1c] p-4">
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            My account
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              aria-label="Open profile"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                profileActive
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
              }`}
            >
              <UserRound size={19} />
              Profile
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              aria-label="Open settings"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                settingsActive
                  ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
              }`}
            >
              <Settings2 size={19} />
              Settings
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-3 text-xs font-semibold text-red-300 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={17} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

