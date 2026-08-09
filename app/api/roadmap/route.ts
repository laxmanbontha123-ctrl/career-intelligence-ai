import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

const learningGuides: Record<
  string,
  {
    foundation: string;
    practice: string;
    project: string;
  }
> = {
  Linux: {
    foundation:
      "Learn the Linux filesystem, terminal commands, users, permissions, processes and package management.",
    practice:
      "Practice file operations, SSH, permissions, services, logs and shell commands in a Linux virtual machine.",
    project:
      "Configure a secure Linux web server and document every command used.",
  },

  "Computer Networking": {
    foundation:
      "Study OSI and TCP/IP models, IP addressing, DNS, HTTP, ports, routing and subnetting.",
    practice:
      "Use ping, tracert, nslookup, ipconfig and Wireshark to inspect real network traffic.",
    project:
      "Design and explain a secure three-tier cloud network architecture.",
  },

  "AWS / Azure": {
    foundation:
      "Learn cloud fundamentals, regions, availability zones, IAM, compute, storage and virtual networking.",
    practice:
      "Launch a virtual server, configure permissions, create storage and deploy a small application.",
    project:
      "Deploy a production-style web application using cloud compute, database, storage and monitoring.",
  },

  Docker: {
    foundation:
      "Learn images, containers, Dockerfiles, ports, volumes, networks and registries.",
    practice:
      "Containerize frontend and backend applications and connect them using Docker networking.",
    project:
      "Create a multi-container application using Docker Compose with persistent storage.",
  },

  "CI/CD": {
    foundation:
      "Understand continuous integration, delivery pipelines, build stages, tests, artifacts and deployment.",
    practice:
      "Create a GitHub Actions workflow that installs dependencies, tests and builds an application.",
    project:
      "Build an automatic deployment pipeline with environment variables and rollback awareness.",
  },

  Terraform: {
    foundation:
      "Learn infrastructure as code, providers, resources, variables, outputs and state management.",
    practice:
      "Provision basic cloud resources using reusable Terraform configuration files.",
    project:
      "Create a modular cloud infrastructure project with remote state and documented deployment steps.",
  },
};

function guideFor(skill: string) {
  return (
    learningGuides[skill] || {
      foundation: `Learn the essential concepts, terminology and professional use cases of ${skill}.`,
      practice: `Complete practical exercises and small implementation tasks using ${skill}.`,
      project: `Build and document a portfolio-ready project that demonstrates ${skill}.`,
    }
  );
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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        userSkills: true,
        roadmapProgress: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (user.userSkills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete your skill assessment first.",
        },
        { status: 400 }
      );
    }

    const requiredSkills = getRequiredSkills(
      user.targetRole || ""
    );

    const gaps = requiredSkills
      .map((required) => {
        const saved = user.userSkills.find(
          (skill) => skill.name === required.name
        );

        const currentLevel = saved?.level || 0;

        return {
          ...required,
          currentLevel,
          gap: Math.max(
            required.requiredLevel - currentLevel,
            0
          ),
        };
      })
      .filter((skill) => skill.gap > 0)
      .sort((a, b) => b.gap - a.gap);

    const priorities =
      gaps.length > 0
        ? gaps.slice(0, 3)
        : requiredSkills.slice(0, 3).map((skill) => ({
            ...skill,
            currentLevel: skill.requiredLevel,
            gap: 0,
          }));

    const baseRoadmap = priorities.map((skill, index) => {
      const guide = guideFor(skill.name);
      const startDay = index * 10 + 1;
      const endDay = (index + 1) * 10;

      return {
        priority: index + 1,
        skill: skill.name,
        category: skill.category,
        currentLevel: skill.currentLevel,
        targetLevel: skill.requiredLevel,
        gap: skill.gap,
        startDay,
        endDay,
        phases: [
          {
            title: "Learn the foundations",
            days: `Day ${startDay}–${startDay + 2}`,
            description: guide.foundation,
          },
          {
            title: "Build practical ability",
            days: `Day ${startDay + 3}–${startDay + 6}`,
            description: guide.practice,
          },
          {
            title: "Create proof of skill",
            days: `Day ${startDay + 7}–${endDay}`,
            description: guide.project,
          },
        ],
      };
    });

    const roadmap = baseRoadmap.map((item) => ({
      ...item,
      phases: item.phases.map((phase) => {
        const taskKey = `${item.skill}-${phase.title}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const progress = user.roadmapProgress.find(
          (entry) => entry.taskKey === taskKey
        );

        return {
          ...phase,
          taskKey,
          completed: progress?.completed || false,
        };
      }),
    }));

    const totalTasks = roadmap.reduce(
      (sum, item) => sum + item.phases.length,
      0
    );

    const completedTasks = roadmap.reduce(
      (sum, item) =>
        sum +
        item.phases.filter((phase) => phase.completed).length,
      0
    );

    const progressPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    return NextResponse.json({
      success: true,
      targetRole: user.targetRole,
      readinessScore: user.readinessScore,
      durationDays: 30,
      generatedAt: new Date().toISOString(),
      totalTasks,
      completedTasks,
      progressPercentage,
      roadmap,
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate your roadmap.",
      },
      { status: 500 }
    );
  }
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

    const body = await request.json();

    const {
      taskKey,
      skill,
      phase,
      completed,
    } = body;

    if (
      typeof taskKey !== "string" ||
      typeof skill !== "string" ||
      typeof phase !== "string" ||
      typeof completed !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid roadmap task.",
        },
        { status: 400 }
      );
    }

    const progress = await prisma.roadmapProgress.upsert({
      where: {
        userId_taskKey: {
          userId: session.userId,
          taskKey,
        },
      },
      update: {
        skill,
        phase,
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.userId,
        taskKey,
        skill,
        phase,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      taskKey: progress.taskKey,
      completed: progress.completed,
    });
  } catch (error) {
    console.error("Roadmap progress error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update roadmap progress.",
      },
      { status: 500 }
    );
  }
}
