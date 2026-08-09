import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { userSkills: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found." },
      { status: 404 }
    );
  }

  const requirements = getRequiredSkills(user.targetRole || "");

  const skills = requirements.map((requirement) => {
    const saved = user.userSkills.find(
      (skill) => skill.name === requirement.name
    );

    return {
      ...requirement,
      level: saved?.level || 0,
    };
  });

  return NextResponse.json({
    success: true,
    targetRole: user.targetRole,
    readinessScore: user.readinessScore,
    skills,
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const submittedSkills = Array.isArray(body.skills)
      ? body.skills
      : [];

    const requirements = getRequiredSkills(user.targetRole || "");

    const normalizedSkills = requirements.map((required) => {
      const submitted = submittedSkills.find(
        (skill: { name?: string }) =>
          skill.name === required.name
      );

      const level = Number(submitted?.level ?? 0);

      return {
        ...required,
        level:
          Number.isInteger(level) && level >= 0 && level <= 5
            ? level
            : 0,
      };
    });

    const totalProgress = normalizedSkills.reduce(
      (sum, skill) =>
        sum +
        Math.min(skill.level / skill.requiredLevel, 1),
      0
    );

    const readinessScore = Math.round(
      (totalProgress / normalizedSkills.length) * 100
    );

    await prisma.$transaction([
      ...normalizedSkills.map((skill) =>
        prisma.userSkill.upsert({
          where: {
            userId_name: {
              userId: session.userId,
              name: skill.name,
            },
          },
          update: {
            category: skill.category,
            level: skill.level,
          },
          create: {
            userId: session.userId,
            name: skill.name,
            category: skill.category,
            level: skill.level,
          },
        })
      ),

      prisma.user.update({
        where: { id: session.userId },
        data: { readinessScore },
      }),
    ]);

    const gaps = normalizedSkills
      .map((skill) => ({
        ...skill,
        gap: Math.max(
          skill.requiredLevel - skill.level,
          0
        ),
      }))
      .sort((a, b) => b.gap - a.gap);

    return NextResponse.json({
      success: true,
      readinessScore,
      gaps,
      message: "Skill assessment saved successfully.",
    });
  } catch (error) {
    console.error("Skill assessment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save skill assessment.",
      },
      { status: 500 }
    );
  }
}