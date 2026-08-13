import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INDIA_TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 24 * 60 * 60 * 1000;

function getIndiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

async function getMissionProgress(userId: number, dateKey: string) {
  const todayMissions = await prisma.dailyMission.findMany({
    where: {
      userId,
      dateKey,
    },
    orderBy: [
      { priority: "asc" },
      { id: "asc" },
    ],
  });

  const completed = todayMissions.filter(
    (mission) => mission.completed
  ).length;

  const recentMissions = await prisma.dailyMission.findMany({
    where: {
      userId,
    },
    select: {
      dateKey: true,
      completed: true,
    },
    orderBy: {
      dateKey: "desc",
    },
  });

  const dayProgress = new Map<
    string,
    { total: number; completed: number }
  >();

  for (const mission of recentMissions) {
    const current = dayProgress.get(mission.dateKey) ?? {
      total: 0,
      completed: 0,
    };

    current.total += 1;

    if (mission.completed) {
      current.completed += 1;
    }

    dayProgress.set(mission.dateKey, current);
  }

  const today = dayProgress.get(dateKey);
  const startOffset =
    today && today.total > 0 && today.completed === today.total
      ? 0
      : 1;

  let streak = 0;

  for (let offset = startOffset; offset < 60; offset += 1) {
    const key = getIndiaDateKey(
      new Date(Date.now() - offset * DAY_MS)
    );

    const progress = dayProgress.get(key);

    if (
      !progress ||
      progress.total === 0 ||
      progress.completed !== progress.total
    ) {
      break;
    }

    streak += 1;
  }

  return {
    missions: todayMissions,
    summary: {
      completed,
      total: todayMissions.length,
      percentage:
        todayMissions.length > 0
          ? Math.round(
              (completed / todayMissions.length) * 100
            )
          : 0,
    },
    streak,
  };
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const dateKey = getIndiaDateKey();

    // Remove completion states created by the old
    // manual-tick prototype. Only verification counts.
    await prisma.dailyMission.updateMany({
      where: {
        userId: session.userId,
        completed: true,
        verifiedAt: null,
      },
      data: {
        completed: false,
        completedAt: null,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        learnerProfile: true,
        userSkills: true,
        resumeAnalyses: {
          select: {
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        interviewAttempts: {
          select: {
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const checkIn = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_dateKey: {
          userId: user.id,
          dateKey,
        },
      },
    });

    const existingCount = await prisma.dailyMission.count({
      where: {
        userId: user.id,
        dateKey,
      },
    });

    if (existingCount === 0) {
      const requiredSkills = getRequiredSkills(
        user.targetRole ?? ""
      );

      const skillGaps = requiredSkills
        .map((required) => {
          const saved = user.userSkills.find(
            (skill) => skill.name === required.name
          );

          const currentLevel = saved?.level ?? 0;

          return {
            ...required,
            currentLevel,
            gap: Math.max(
              required.requiredLevel - currentLevel,
              0
            ),
          };
        })
        .sort((a, b) => b.gap - a.gap);

      const gapCandidates = skillGaps.filter(
        (skill) => skill.gap > 0
      );

      const dayIndex = Math.floor(Date.now() / DAY_MS);

      const focusSkill =
        gapCandidates[
          dayIndex % Math.max(gapCandidates.length, 1)
        ] ??
        skillGaps[0];

      const availableMinutes =
        checkIn?.availableMinutes ?? 60;

      const academicContext =
        user.learnerProfile?.branch ??
        user.learnerProfile?.degree ??
        "your current academic subject";

      const hasResume =
        user.resumeAnalyses.length > 0;

      const hasInterview =
        user.interviewAttempts.length > 0;

      const careerMission = !hasResume
        ? {
            title: "Check your resume readiness",
            description:
              "Run an ATS analysis and note the top three improvements for your target role.",
            actionUrl: "/resume-analyzer",
          }
        : !hasInterview
          ? {
              title: "Practice one interview answer",
              description:
                "Complete a role-focused mock interview question and review the ideal answer.",
              actionUrl: "/interview",
            }
          : {
              title: "Ask your AI career mentor",
              description:
                "Request one practical next action based on your current profile and progress.",
              actionUrl: "/mentor",
            };

      const missions = [
        {
          userId: user.id,
          dateKey,
          missionKey: "priority-skill",
          category: "SKILL",
          title: `Strengthen ${focusSkill?.name ?? "your priority skill"}`,
          description:
            focusSkill && focusSkill.gap > 0
              ? `Improve this skill by ${focusSkill.gap} level${focusSkill.gap === 1 ? "" : "s"}. Complete one focused lesson and one practical exercise.`
              : "Revise one important target-role skill and complete a practical exercise.",
          actionUrl:
            user.userSkills.length > 0
              ? "/roadmap"
              : "/assessment",
          priority: 1,
          estimatedMinutes: Math.max(
            20,
            Math.round(availableMinutes * 0.4)
          ),
        },
        {
          userId: user.id,
          dateKey,
          missionKey: "academic-focus",
          category: "ACADEMIC",
          title: `Complete a focused ${academicContext} study block`,
          description:
            "Choose one difficult concept, study it without distractions, and write a five-point summary.",
          actionUrl: "/mentor",
          priority: 2,
          estimatedMinutes: Math.max(
            20,
            Math.round(availableMinutes * 0.35)
          ),
        },
        {
          userId: user.id,
          dateKey,
          missionKey: "career-action",
          category: "CAREER",
          title: careerMission.title,
          description: careerMission.description,
          actionUrl: careerMission.actionUrl,
          priority: 3,
          estimatedMinutes: Math.max(
            15,
            Math.round(availableMinutes * 0.25)
          ),
        },
      ];

      await prisma.$transaction(
        missions.map((mission) =>
          prisma.dailyMission.upsert({
            where: {
              userId_dateKey_missionKey: {
                userId: user.id,
                dateKey,
                missionKey: mission.missionKey,
              },
            },
            update: {},
            create: mission,
          })
        )
      );
    }

    const progress = await getMissionProgress(
      user.id,
      dateKey
    );

    return NextResponse.json({
      success: true,
      dateKey,
      targetRole: user.targetRole,
      checkIn,
      ...progress,
    });
  } catch (error) {
    console.error(
      "Daily Copilot GET error:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to prepare today's guidance.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Manual completion is disabled. Complete the AI lesson, practical task and verification quiz.",
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    }
  );
}
