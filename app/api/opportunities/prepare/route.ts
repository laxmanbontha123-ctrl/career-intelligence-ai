import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(
  request: Request
) {
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

    const { searchParams } = new URL(request.url);
    const opportunityId = Number(
      searchParams.get("opportunityId")
    );

    if (
      !Number.isInteger(opportunityId) ||
      opportunityId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid opportunity ID.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        userSkills: true,
        learnerProfile: true,
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

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          skills: true,
        },
      });

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message: "Opportunity not found.",
        },
        { status: 404 }
      );
    }

    const userSkillMap = new Map(
      user.userSkills.map((skill) => [
        normalize(skill.name),
        skill.level,
      ])
    );

    const skillAnalysis = opportunity.skills.map(
      (requiredSkill) => {
        const currentLevel =
          userSkillMap.get(
            normalize(requiredSkill.skillName)
          ) ?? 0;

        const gap = Math.max(
          requiredSkill.requiredLevel -
            currentLevel,
          0
        );

        return {
          name: requiredSkill.skillName,
          currentLevel,
          requiredLevel:
            requiredSkill.requiredLevel,
          gap,
          ready:
            currentLevel >=
            requiredSkill.requiredLevel,
        };
      }
    );

    const gaps = skillAnalysis
      .filter((skill) => !skill.ready)
      .sort((a, b) => b.gap - a.gap);

    const matched = skillAnalysis.filter(
      (skill) => skill.ready
    );

    const preparationSteps = gaps
      .slice(0, 3)
      .map((skill, index) => ({
        priority: index + 1,
        skill: skill.name,
        currentLevel: skill.currentLevel,
        targetLevel: skill.requiredLevel,
        gap: skill.gap,
        stages: [
          {
            key: "LEARN",
            title: `Learn ${skill.name}`,
            description: `Understand the core concepts, terminology and practical use of ${skill.name}.`,
          },
          {
            key: "PRACTICE",
            title: `Practice ${skill.name}`,
            description: `Complete hands-on exercises that demonstrate real usage of ${skill.name}.`,
          },
          {
            key: "PROVE",
            title: `Prove ${skill.name}`,
            description: `Complete a practical task and verification so the skill can be treated as demonstrated evidence.`,
          },
        ],
      }));

    return NextResponse.json({
      success: true,
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        type: opportunity.type,
      },
      targetRole: user.targetRole,
      readinessScore: user.readinessScore,
      learner: user.learnerProfile
        ? {
            institution:
              user.learnerProfile.institution,
            degree: user.learnerProfile.degree,
            branch: user.learnerProfile.branch,
            graduationYear:
              user.learnerProfile.graduationYear,
          }
        : null,
      matched,
      gaps,
      preparationSteps,
      totalGaps: gaps.length,
    });
  } catch (error) {
    console.error(
      "Opportunity preparation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to prepare this opportunity.",
      },
      { status: 500 }
    );
  }
}
