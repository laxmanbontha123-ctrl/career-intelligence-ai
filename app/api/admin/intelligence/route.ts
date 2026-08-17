import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function startOfDaysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Administrator access required." },
        { status: 403 }
      );
    }

    const sevenDaysAgo = startOfDaysAgo(7);
    const thirtyDaysAgo = startOfDaysAgo(30);

    const [
      learnerStats,
      activeLearners,
      completedProfiles,
      targetRoles,
      skillUsage,
      roadmapStats,
      missionStats,
      checkInCount,
      mentorMessages,
      interviewStats,
      resumeStats,
      opportunities,
      savedOpportunities,
      recentLearners,
    ] = await Promise.all([
      prisma.user.aggregate({
        where: { role: "student" },
        _count: { _all: true },
        _avg: { readinessScore: true },
      }),

      prisma.user.count({
        where: {
          role: "student",
          updatedAt: { gte: sevenDaysAgo },
        },
      }),

      prisma.user.count({
        where: {
          role: "student",
          profileCompleted: true,
        },
      }),

      prisma.user.groupBy({
        by: ["targetRole"],
        where: {
          role: "student",
          targetRole: { not: null },
        },
        _count: { _all: true },
        orderBy: {
          _count: {
            targetRole: "desc",
          },
        },
        take: 8,
      }),

      prisma.userSkill.groupBy({
        by: ["name"],
        _count: { _all: true },
        _avg: { level: true },
        orderBy: {
          _count: {
            name: "desc",
          },
        },
        take: 10,
      }),

      prisma.roadmapProgress.groupBy({
        by: ["completed"],
        _count: { _all: true },
      }),

      prisma.dailyMission.groupBy({
        by: ["completed"],
        _count: { _all: true },
      }),

      prisma.dailyCheckIn.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      prisma.mentorMessage.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      prisma.interviewAttempt.aggregate({
        _count: { _all: true },
        _avg: { score: true },
      }),

      prisma.resumeAnalysis.aggregate({
        _count: { _all: true },
        _avg: { atsScore: true },
      }),

      prisma.opportunity.count({
        where: { active: true },
      }),

      prisma.savedOpportunity.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      prisma.user.findMany({
        where: { role: "student" },
        select: {
          id: true,
          name: true,
          targetRole: true,
          readinessScore: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 8,
      }),
    ]);

    const totalLearners = learnerStats._count._all;
    const averageReadiness = Math.round(
      learnerStats._avg.readinessScore ?? 0
    );

    const roadmapCompleted =
      roadmapStats.find((item) => item.completed)?._count._all ?? 0;

    const roadmapTotal = roadmapStats.reduce(
      (sum, item) => sum + item._count._all,
      0
    );

    const missionCompleted =
      missionStats.find((item) => item.completed)?._count._all ?? 0;

    const missionTotal = missionStats.reduce(
      (sum, item) => sum + item._count._all,
      0
    );

    const roadmapCompletion = roadmapTotal
      ? Math.round((roadmapCompleted / roadmapTotal) * 100)
      : 0;

    const missionCompletion = missionTotal
      ? Math.round((missionCompleted / missionTotal) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      overview: {
        totalLearners,
        activeLearners,
        completedProfiles,
        profileCompletion: totalLearners
          ? Math.round((completedProfiles / totalLearners) * 100)
          : 0,
        averageReadiness,
        roadmapCompletion,
        missionCompletion,
        opportunities,
        savedOpportunities,
        checkIns: checkInCount,
        mentorMessages,
        interviewAttempts: interviewStats._count._all,
        interviewAverage: Math.round(
          interviewStats._avg.score ?? 0
        ),
        resumeAnalyses: resumeStats._count._all,
        averageAtsScore: Math.round(
          resumeStats._avg.atsScore ?? 0
        ),
      },
      targetRoles: targetRoles.map((item) => ({
        role: item.targetRole,
        count: item._count._all,
      })),
      skills: skillUsage.map((item) => ({
        name: item.name,
        learners: item._count._all,
        averageLevel: Math.round(item._avg.level ?? 0),
      })),
      recentLearners: recentLearners.map((item) => ({
        id: item.id,
        name: item.name || "Unnamed learner",
        targetRole: item.targetRole || "Not set",
        readinessScore: item.readinessScore,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Admin intelligence error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load admin intelligence.",
      },
      { status: 500 }
    );
  }
}


