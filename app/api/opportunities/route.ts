import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type OpportunityWithSkills = {
  id: number;
  title: string;
  company: string;
  type: string;
  description: string;
  location: string | null;
  workMode: string | null;
  applicationUrl: string | null;
  deadline: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  skills: {
    id: number;
    opportunityId: number;
    skillName: string;
    requiredLevel: number;
  }[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function calculateMatch(
  opportunity: OpportunityWithSkills,
  userSkills: {
    name: string;
    level: number;
  }[],
  targetRole: string | null,
  readinessScore: number
) {
  const userSkillMap = new Map(
    userSkills.map((skill) => [
      normalize(skill.name),
      skill.level,
    ])
  );

  const matchedSkills: {
    name: string;
    level: number;
    requiredLevel: number;
    status: "STRONG" | "GOOD" | "PARTIAL";
  }[] = [];

  const missingSkills: {
    name: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
  }[] = [];

  let skillPoints = 0;
  let maximumSkillPoints = 0;

  for (const required of opportunity.skills) {
    const currentLevel = userSkillMap.get(
      normalize(required.skillName)
    ) ?? 0;

    maximumSkillPoints += Math.max(required.requiredLevel, 1);

    const contribution = Math.min(
      currentLevel / Math.max(required.requiredLevel, 1),
      1
    );

    skillPoints += contribution;

    if (currentLevel >= required.requiredLevel) {
      matchedSkills.push({
        name: required.skillName,
        level: currentLevel,
        requiredLevel: required.requiredLevel,
        status:
          currentLevel >= required.requiredLevel + 1
            ? "STRONG"
            : "GOOD",
      });
    } else if (currentLevel > 0) {
      matchedSkills.push({
        name: required.skillName,
        level: currentLevel,
        requiredLevel: required.requiredLevel,
        status: "PARTIAL",
      });

      missingSkills.push({
        name: required.skillName,
        currentLevel,
        requiredLevel: required.requiredLevel,
        gap: required.requiredLevel - currentLevel,
      });
    } else {
      missingSkills.push({
        name: required.skillName,
        currentLevel: 0,
        requiredLevel: required.requiredLevel,
        gap: required.requiredLevel,
      });
    }
  }

  const skillMatch =
    maximumSkillPoints === 0
      ? 0
      : Math.round(
          (skillPoints / maximumSkillPoints) * 100
        );

  const roleMatch =
    targetRole &&
    (
      opportunity.title
        .toLowerCase()
        .includes(targetRole.toLowerCase()) ||
      opportunity.description
        .toLowerCase()
        .includes(targetRole.toLowerCase())
    )
      ? 100
      : 50;

  const resumeEvidence = Math.min(
    readinessScore + 20,
    100
  );

  const matchScore = Math.min(
    Math.round(
      skillMatch * 0.6 +
      roleMatch * 0.2 +
      resumeEvidence * 0.1 +
      readinessScore * 0.1
    ),
    100
  );

  const reasons: string[] = [];

  if (matchedSkills.length > 0) {
    reasons.push(
      `You already have ${matchedSkills.length} relevant skill${
        matchedSkills.length === 1 ? "" : "s"
      } needed for this opportunity.`
    );
  }

  if (targetRole) {
    reasons.push(
      `This opportunity is being evaluated against your target role: ${targetRole}.`
    );
  }

  if (readinessScore >= 70) {
    reasons.push(
      "Your current career readiness score indicates a strong foundation."
    );
  }

  if (missingSkills.length > 0) {
    reasons.push(
      `You have ${missingSkills.length} skill gap${
        missingSkills.length === 1 ? "" : "s"
      } to close before becoming fully ready.`
    );
  }

  return {
    matchScore,
    skillMatch,
    matchedSkills,
    missingSkills,
    reasons,
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

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        userSkills: true,
        savedOpportunities: true,
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

    const opportunities =
      await prisma.opportunity.findMany({
        where: {
          active: true,
          OR: [
            {
              deadline: null,
            },
            {
              deadline: {
                gte: new Date(),
              },
            },
          ],
        },
        include: {
          skills: true,
        },
        orderBy: [
          {
            deadline: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    const results = opportunities
      .map((opportunity) => {
        const match = calculateMatch(
          opportunity,
          user.userSkills,
          user.targetRole,
          user.readinessScore
        );

        return {
          id: opportunity.id,
          title: opportunity.title,
          company: opportunity.company,
          type: opportunity.type,
          description: opportunity.description,
          location: opportunity.location,
          workMode: opportunity.workMode,
          applicationUrl: opportunity.applicationUrl,
          deadline: opportunity.deadline,
          matchScore: match.matchScore,
          skillMatch: match.skillMatch,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.reasons,
          saved: user.savedOpportunities.some(
            (saved) =>
              saved.opportunityId === opportunity.id
          ),
        };
      })
      .sort(
        (a, b) => b.matchScore - a.matchScore
      );

    return NextResponse.json({
      success: true,
      targetRole: user.targetRole,
      readinessScore: user.readinessScore,
      total: results.length,
      opportunities: results,
    });
  } catch (error) {
    console.error(
      "Opportunity API GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load career opportunities.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();

    const opportunityId = Number(
      body.opportunityId
    );

    if (
      !Number.isInteger(opportunityId) ||
      opportunityId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid opportunity.",
        },
        { status: 400 }
      );
    }

    const opportunity =
      await prisma.opportunity.findFirst({
        where: {
          id: opportunityId,
          active: true,
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

    const existing =
      await prisma.savedOpportunity.findUnique({
        where: {
          userId_opportunityId: {
            userId: session.userId,
            opportunityId,
          },
        },
      });

    if (existing) {
      await prisma.savedOpportunity.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        success: true,
        saved: false,
      });
    }

    await prisma.savedOpportunity.create({
      data: {
        userId: session.userId,
        opportunityId,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
    });
  } catch (error) {
    console.error(
      "Opportunity save error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update saved opportunity.",
      },
      { status: 500 }
    );
  }
}
