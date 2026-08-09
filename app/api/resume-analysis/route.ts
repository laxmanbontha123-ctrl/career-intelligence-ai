import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

const sectionChecks = [
  {
    name: "Contact Information",
    patterns: ["@", "linkedin", "github", "phone"],
  },
  {
    name: "Professional Summary",
    patterns: ["summary", "objective", "profile"],
  },
  {
    name: "Education",
    patterns: ["education", "b.tech", "degree", "college"],
  },
  {
    name: "Skills",
    patterns: ["skills", "technical skills", "technologies"],
  },
  {
    name: "Projects",
    patterns: ["projects", "project"],
  },
  {
    name: "Experience",
    patterns: ["experience", "internship", "work experience"],
  },
  {
    name: "Certifications",
    patterns: ["certifications", "certificates", "certified"],
  },
];

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const analyses = await prisma.resumeAnalysis.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    success: true,
    history: analyses.map((analysis) => ({
      id: analysis.id,
      atsScore: analysis.atsScore,
      matchedKeywords: safeParse(
        analysis.matchedKeywords
      ),
      missingKeywords: safeParse(
        analysis.missingKeywords
      ),
      strengths: safeParse(analysis.strengths),
      suggestions: safeParse(analysis.suggestions),
      createdAt: analysis.createdAt,
    })),
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

    const body = await request.json();
    const resumeText =
      typeof body.resumeText === "string"
        ? body.resumeText.trim()
        : "";

    if (resumeText.length < 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a complete resume with at least 150 characters.",
        },
        { status: 400 }
      );
    }

    if (resumeText.length > 30000) {
      return NextResponse.json(
        {
          success: false,
          message: "Resume content is too large.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { learnerProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const normalizedText = resumeText.toLowerCase();
    const requiredSkills = getRequiredSkills(
      user.targetRole || ""
    );

    const keywords = requiredSkills.map(
      (skill) => skill.name
    );

    const keywordAliases: Record<string, string[]> = {
      "AWS / Azure": [
        "aws",
        "azure",
        "amazon web services",
        "microsoft azure",
      ],
      "Computer Networking": [
        "computer networking",
        "networking",
        "tcp/ip",
        "osi model",
      ],
      "CI/CD": [
        "ci/cd",
        "continuous integration",
        "continuous deployment",
        "github actions",
        "jenkins",
      ],
      Docker: [
        "docker",
        "containerization",
        "containers",
      ],
      Terraform: [
        "terraform",
        "infrastructure as code",
        "iac",
      ],
      Linux: [
        "linux",
        "ubuntu",
        "shell scripting",
        "bash",
      ],
    };

    function keywordIsPresent(keyword: string) {
      const aliases = keywordAliases[keyword] || [
        keyword.toLowerCase(),
      ];

      return aliases.some((alias) =>
        normalizedText.includes(alias.toLowerCase())
      );
    }

    const matchedKeywords = keywords.filter(
      keywordIsPresent
    );

    const missingKeywords = keywords.filter(
      (keyword) => !keywordIsPresent(keyword)
    );

    const detectedSections = sectionChecks.filter(
      (section) =>
        section.patterns.some((pattern) =>
          normalizedText.includes(pattern)
        )
    );

    const missingSections = sectionChecks.filter(
      (section) =>
        !section.patterns.some((pattern) =>
          normalizedText.includes(pattern)
        )
    );

    const keywordScore = Math.round(
      (matchedKeywords.length / keywords.length) * 60
    );

    const sectionScore = Math.round(
      (detectedSections.length / sectionChecks.length) *
        30
    );

    const wordCount = resumeText
      .split(/\s+/)
      .filter(Boolean).length;

    const lengthScore =
      wordCount >= 300 && wordCount <= 800
        ? 10
        : wordCount >= 180
          ? 7
          : 4;

    const atsScore = Math.min(
      keywordScore + sectionScore + lengthScore,
      100
    );

    const strengths: string[] = [];

    if (matchedKeywords.length >= 4) {
      strengths.push(
        "Strong alignment with the selected target career."
      );
    }

    if (detectedSections.length >= 6) {
      strengths.push(
        "Resume contains most essential professional sections."
      );
    }

    if (
      normalizedText.includes("project") ||
      normalizedText.includes("internship")
    ) {
      strengths.push(
        "Practical experience or projects are represented."
      );
    }

    if (
      normalizedText.includes("github") ||
      normalizedText.includes("linkedin")
    ) {
      strengths.push(
        "Professional online profiles are included."
      );
    }

    if (strengths.length === 0) {
      strengths.push(
        "The resume provides a starting foundation for improvement."
      );
    }

    const suggestions: string[] = [];

    if (missingKeywords.length > 0) {
      suggestions.push(
        `Add genuine evidence for these target-role skills: ${missingKeywords.join(
          ", "
        )}.`
      );
    }

    if (missingSections.length > 0) {
      suggestions.push(
        `Add or improve these sections: ${missingSections
          .map((section) => section.name)
          .join(", ")}.`
      );
    }

    if (wordCount < 300) {
      suggestions.push(
        "Add measurable project achievements and technical responsibilities."
      );
    }

    if (wordCount > 800) {
      suggestions.push(
        "Reduce unnecessary content and keep the resume concise."
      );
    }

    if (
      !/\b\d+%|\b\d+\+|\b\d+\s*(users|projects|days|hours)\b/i.test(
        resumeText
      )
    ) {
      suggestions.push(
        "Use measurable achievements such as percentages, users, projects or performance improvements."
      );
    }

    if (
      !normalizedText.includes("github") &&
      !normalizedText.includes("portfolio")
    ) {
      suggestions.push(
        "Include a GitHub or portfolio link to prove practical skills."
      );
    }

    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId: session.userId,
        resumeText,
        atsScore,
        matchedKeywords: JSON.stringify(
          matchedKeywords
        ),
        missingKeywords: JSON.stringify(
          missingKeywords
        ),
        strengths: JSON.stringify(strengths),
        suggestions: JSON.stringify(suggestions),
      },
    });

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      targetRole: user.targetRole,
      atsScore,
      wordCount,
      matchedKeywords,
      missingKeywords,
      detectedSections: detectedSections.map(
        (section) => section.name
      ),
      missingSections: missingSections.map(
        (section) => section.name
      ),
      strengths,
      suggestions,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to analyze your resume.",
      },
      { status: 500 }
    );
  }
}