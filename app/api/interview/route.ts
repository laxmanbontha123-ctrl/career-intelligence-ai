import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRequiredSkills } from "@/lib/role-skills";

async function askGemini(
  prompt: string,
  maxOutputTokens: number
) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("AI service is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Interview Gemini error:", data);

    throw new Error(
      data?.error?.message ||
        "AI interview service is unavailable."
    );
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Invalid Gemini interview JSON:",
      cleaned.slice(0, 500)
    );

    throw new Error(
      "AI response was incomplete. Please generate again."
    );
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

  const attempts =
    await prisma.interviewAttempt.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

  return NextResponse.json({
    success: true,
    attempts: attempts.map((attempt) => ({
      ...attempt,
      strengths: JSON.parse(attempt.strengths),
      improvements: JSON.parse(
        attempt.improvements
      ),
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
    const action = body.action;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        learnerProfile: true,
        userSkills: true,
      },
    });

    if (!user || !user.learnerProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete your learner profile first.",
        },
        { status: 400 }
      );
    }

    const requiredSkills = getRequiredSkills(
      user.targetRole || ""
    );

    const skillProfile = requiredSkills
      .map((required) => {
        const saved = user.userSkills.find(
          (skill) => skill.name === required.name
        );

        return `${required.name}: ${
          saved?.level || 0
        }/5`;
      })
      .join(", ");

    if (action === "generate") {
      const difficulty = [
        "Beginner",
        "Intermediate",
        "Advanced",
      ].includes(body.difficulty)
        ? body.difficulty
        : "Intermediate";

      const result = await askGemini(
        `
Generate one realistic ${difficulty} technical interview
question for a ${user.targetRole} candidate.

Student context:
- Degree: ${user.learnerProfile.degree}
- Branch: ${user.learnerProfile.branch}
- Current year: ${user.learnerProfile.currentYear}
- Career readiness: ${user.readinessScore}%
- Current skills: ${skillProfile}

Requirements:
- Ask only one question.
- Make it suitable for the chosen difficulty.
- Prefer practical understanding over memorization.
- Do not include the answer.
- Return valid JSON only in this exact structure:
{
  "question": "question text",
  "focusArea": "main skill tested",
  "difficulty": "${difficulty}"
}
        `.trim(),
        1600
      );

      if (
        typeof result.question !== "string" ||
        !result.question.trim()
      ) {
        throw new Error(
          "AI generated an invalid interview question."
        );
      }

      return NextResponse.json({
        success: true,
        question: result.question.trim(),
        focusArea:
          typeof result.focusArea === "string"
            ? result.focusArea
            : "Technical Skills",
        difficulty,
      });
    }

    if (action === "evaluate") {
      const question =
        typeof body.question === "string"
          ? body.question.trim()
          : "";

      const answer =
        typeof body.answer === "string"
          ? body.answer.trim()
          : "";

      const difficulty =
        typeof body.difficulty === "string"
          ? body.difficulty
          : "Intermediate";

      if (!question || answer.length < 20) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide a meaningful answer of at least 20 characters.",
          },
          { status: 400 }
        );
      }

      if (answer.length > 6000) {
        return NextResponse.json(
          {
            success: false,
            message: "Your answer is too long.",
          },
          { status: 400 }
        );
      }

      const result = await askGemini(
        `
Act as a strict but supportive technical interviewer.

Target role: ${user.targetRole}
Difficulty: ${difficulty}
Question: ${question}
Candidate answer: ${answer}

Evaluate technical correctness, relevance, clarity,
practical understanding and completeness.

Return valid JSON only:
{
  "score": 0,
  "strengths": ["specific strength"],
  "improvements": ["specific missing or incorrect point"],
  "idealAnswer": "A clear model answer in 150 to 250 words"
}

Rules:
- score must be an integer from 0 to 100.
- Do not reward incorrect claims.
- Give 2 to 4 concise strengths.
- Give 2 to 4 actionable improvements.
- Do not use Markdown inside JSON strings.
        `.trim(),
        3200
      );

      const score = Math.max(
        0,
        Math.min(100, Math.round(Number(result.score) || 0))
      );

      const strengths = Array.isArray(result.strengths)
        ? result.strengths
            .filter(
              (item: unknown) =>
                typeof item === "string"
            )
            .slice(0, 4)
        : [];

      const improvements = Array.isArray(
        result.improvements
      )
        ? result.improvements
            .filter(
              (item: unknown) =>
                typeof item === "string"
            )
            .slice(0, 4)
        : [];

      const idealAnswer =
        typeof result.idealAnswer === "string"
          ? result.idealAnswer.trim()
          : "";

      const attempt =
        await prisma.interviewAttempt.create({
          data: {
            userId: session.userId,
            targetRole: user.targetRole || "",
            difficulty,
            question,
            answer,
            score,
            strengths: JSON.stringify(strengths),
            improvements:
              JSON.stringify(improvements),
            idealAnswer,
          },
        });

      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        score,
        strengths,
        improvements,
        idealAnswer,
        createdAt: attempt.createdAt,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid interview action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Interview API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process interview request.",
      },
      { status: 500 }
    );
  }
}