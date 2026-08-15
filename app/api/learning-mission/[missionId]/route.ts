import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    missionId: string;
  }>;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type GeneratedLesson = {
  lessonTitle: string;
  objectives: string[];
  lessonMarkdown: string;
  practiceMarkdown: string;
  sources: string[];
  quiz: QuizQuestion[];
};

function parseMissionId(value: string) {
  const missionId = Number(value);

  if (!Number.isInteger(missionId) || missionId <= 0) {
    return null;
  }

  return missionId;
}

function parseGeneratedJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini did not return valid lesson JSON.");
  }

  return JSON.parse(
    cleaned.slice(start, end + 1)
  ) as unknown;
}

function validateLesson(value: unknown): GeneratedLesson {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid lesson content.");
  }

  const lesson = value as Partial<GeneratedLesson>;

  if (
    typeof lesson.lessonTitle !== "string" ||
    !Array.isArray(lesson.objectives) ||
    typeof lesson.lessonMarkdown !== "string" ||
    typeof lesson.practiceMarkdown !== "string" ||
    !Array.isArray(lesson.sources) ||
    !Array.isArray(lesson.quiz) ||
    lesson.quiz.length < 5
  ) {
    throw new Error("Incomplete lesson content.");
  }

  if (
    lesson.lessonMarkdown.trim().length < 2500 ||
    lesson.practiceMarkdown.trim().length < 800
  ) {
    throw new Error(
      "Gemini lesson was shorter than required."
    );
  }

  const quiz = lesson.quiz.map((question) => {
    if (
      !question ||
      typeof question.question !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer > 3 ||
      typeof question.explanation !== "string"
    ) {
      throw new Error("Invalid quiz question.");
    }

    return {
      question: question.question,
      options: question.options.map(String),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  });

  return {
    lessonTitle: lesson.lessonTitle,
    objectives: lesson.objectives.map(String).slice(0, 5),
    lessonMarkdown: lesson.lessonMarkdown,
    practiceMarkdown: lesson.practiceMarkdown,
    sources: lesson.sources.map(String).slice(0, 6),
    quiz,
  };
}

function createFallbackLesson(input: {
  missionTitle: string;
  missionDescription: string;
  category: string;
  targetRole: string | null;
  degree: string | null;
  branch: string | null;
}): GeneratedLesson {
  const topic =
    input.missionTitle.trim() || input.category;

  const description =
    input.missionDescription.trim() ||
    `Build practical confidence in ${topic}.`;

  return {
    lessonTitle: `${topic}: guided mastery lesson`,
    objectives: [
      `Explain the purpose and fundamentals of ${topic}.`,
      `Identify the inputs, process and expected output.`,
      `Apply ${topic} through a practical exercise.`,
      `Recognize common mistakes and correct them.`,
      `Verify learning with evidence and a quiz.`,
    ],
    lessonMarkdown: [
      `## Why this topic matters`,
      `${description}`,
      `For a ${input.targetRole || "career-ready student"}, learning **${topic}** means understanding the concept, applying it and explaining the result.`,
      `## Learn it using five questions`,
      `1. **Purpose:** What problem does ${topic} solve?`,
      `2. **Inputs:** What information, tools or prerequisites are required?`,
      `3. **Process:** What steps must be performed in the correct order?`,
      `4. **Output:** What successful result should appear?`,
      `5. **Failure conditions:** What common mistakes can prevent success?`,
      `## Practical learning method`,
      `Study one trusted explanation, reproduce one working example and then change one part of the example yourself. Record the output and explain what changed.`,
      `## Common mistakes`,
      `- Copying steps without understanding their purpose.`,
      `- Skipping prerequisites or verification.`,
      `- Ignoring error messages instead of isolating the cause.`,
      `- Marking the task complete without producing evidence.`,
      `## Completion standard`,
      `You have learned ${topic} only when you can explain it simply, complete the practical task and score at least 80% in the verification quiz.`,
    ].join("\n\n"),
    practiceMarkdown: [
      `## Required practical task`,
      `1. Write a two-sentence definition of **${topic}**.`,
      `2. List its required inputs, main process and expected output.`,
      `3. Complete one small working example using an appropriate tool.`,
      `4. Change one input or configuration and observe the result.`,
      `5. Write at least 80 characters explaining what you did, the output obtained and one mistake you corrected.`,
    ].join("\n\n"),
    sources: [
      `Official documentation for ${topic}`,
      `Trusted course material for ${input.branch || input.degree || "the selected topic"}`,
    ],
    quiz: [
      {
        question: `Which result best proves that ${topic} was learned?`,
        options: [
          "A working output with a clear explanation",
          "Opening the lesson page",
          "Copying notes without practice",
          "Marking the task complete immediately",
        ],
        correctAnswer: 0,
        explanation:
          "Real learning requires both practical evidence and understanding.",
      },
      {
        question: "What should be identified before starting the practical task?",
        options: [
          "Only the completion time",
          "Inputs, process and expected output",
          "Only the final answer",
          "The easiest shortcut",
        ],
        correctAnswer: 1,
        explanation:
          "Understanding inputs, process and output creates a reliable learning path.",
      },
      {
        question: "What is the best response when the practical output fails?",
        options: [
          "Mark the mission complete",
          "Ignore the error",
          "Read the error and isolate its cause",
          "Repeat randomly",
        ],
        correctAnswer: 2,
        explanation:
          "Error analysis is an important part of practical mastery.",
      },
      {
        question: "Why should one input or configuration be changed?",
        options: [
          "To make the task longer",
          "To verify cause-and-effect understanding",
          "To avoid creating evidence",
          "To skip the fundamentals",
        ],
        correctAnswer: 1,
        explanation:
          "Changing one variable confirms that the learner understands its effect.",
      },
      {
        question: "When is this mission considered verified?",
        options: [
          "Immediately after opening it",
          "After reading only the heading",
          "After practical evidence and the required quiz score",
          "After waiting for the timer",
        ],
        correctAnswer: 2,
        explanation:
          "CareerIntel requires evidence and a passing score before completion.",
      },
    ],
  };
}
async function generateLesson(input: {
  missionTitle: string;
  missionDescription: string;
  category: string;
  targetRole: string | null;
  degree: string | null;
  branch: string | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model =
    process.env.GEMINI_TUTOR_MODEL ||
    "gemini-3.5-flash-lite";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
You are CareerIntel's expert AI tutor.

Create a complete, beginner-friendly verified learning mission.

Student context:
- Target role: ${input.targetRole || "Not specified"}
- Degree: ${input.degree || "Not specified"}
- Branch: ${input.branch || "Not specified"}
- Mission category: ${input.category}
- Mission title: ${input.missionTitle}
- Mission description: ${input.missionDescription}

Requirements:
1. Teach the topic clearly from fundamentals.
2. Use simple professional English.
3. Include definitions, examples and common mistakes.
4. Include a practical exercise the student must perform.
4A. lessonMarkdown must contain 900 to 1200 useful words.
4B. Include fundamentals, important terminology, concept explanation, at least two realistic examples, common mistakes, troubleshooting and a concise revision summary.
4C. practiceMarkdown must contain prerequisites, 8 to 12 exact numbered steps, commands or examples wherever relevant, expected output for every important step and a final evidence checklist.
4D. The practical task must produce a real observable output. Do not give vague instructions such as only read, explore or understand.
4E. Keep the lesson specific to the mission topic and the student's target role.
5. Create exactly 5 multiple-choice questions.
6. Each question must have exactly 4 options.
7. correctAnswer must be a zero-based option index from 0 to 3.
8. Include short explanations for correct answers.
9. Recommend official or trusted learning sources.
10. Keep lessonMarkdown between 700 and 1000 words.
11. Keep every explanation concise so the complete JSON is never truncated.
10. Do not include markdown code fences around the JSON.

Return only valid JSON using this exact structure:
{
  "lessonTitle": "string",
  "objectives": ["string"],
  "lessonMarkdown": "detailed markdown lesson",
  "practiceMarkdown": "step-by-step practical exercise",
  "sources": ["trusted source name or URL"],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}
`;

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
          thinkingConfig: {
            thinkingLevel: "MINIMAL",
          },
          maxOutputTokens: 4500,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            required: [
              "lessonTitle",
              "objectives",
              "lessonMarkdown",
              "practiceMarkdown",
              "sources",
              "quiz",
            ],
            properties: {
              lessonTitle: {
                type: "STRING",
              },
              objectives: {
                type: "ARRAY",
                items: {
                  type: "STRING",
                },
              },
              lessonMarkdown: {
                type: "STRING",
              },
              practiceMarkdown: {
                type: "STRING",
              },
              sources: {
                type: "ARRAY",
                items: {
                  type: "STRING",
                },
              },
              quiz: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  required: [
                    "question",
                    "options",
                    "correctAnswer",
                    "explanation",
                  ],
                  properties: {
                    question: {
                      type: "STRING",
                    },
                    options: {
                      type: "ARRAY",
                      items: {
                        type: "STRING",
                      },
                    },
                    correctAnswer: {
                      type: "INTEGER",
                    },
                    explanation: {
                      type: "STRING",
                    },
                  },
                },
              },
            },
          },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(40000),
    }
  );

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ||
        "Unable to generate the learning mission."
    );
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty lesson.");
  }

  return validateLesson(parseGeneratedJson(text));
}

async function getOwnedMission(
  missionId: number,
  userId: number
) {
  return prisma.dailyMission.findFirst({
    where: {
      id: missionId,
      userId,
    },
    include: {
      learningContent: true,
      attempts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          score: true,
          passed: true,
          feedback: true,
          createdAt: true,
        },
      },
      user: {
        include: {
          learnerProfile: true,
        },
      },
    },
  });
}

async function hasBlockingMission(input: {
  missionId: number;
  userId: number;
  dateKey: string;
  priority: number;
}) {
  const blocker = await prisma.dailyMission.findFirst({
    where: {
      userId: input.userId,
      dateKey: input.dateKey,
      verifiedAt: null,
      OR: [
        {
          priority: {
            lt: input.priority,
          },
        },
        {
          priority: input.priority,
          id: {
            lt: input.missionId,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(blocker);
}

export async function GET(
  _request: Request,
  context: RouteContext
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

    const { missionId: missionIdValue } =
      await context.params;

    const missionId = parseMissionId(missionIdValue);

    if (!missionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mission.",
        },
        { status: 400 }
      );
    }

    let mission = await getOwnedMission(
      missionId,
      session.userId
    );

    if (!mission) {
      return NextResponse.json(
        {
          success: false,
          message: "Mission not found.",
        },
        { status: 404 }
      );
    }

    const locked = await hasBlockingMission({
      missionId: mission.id,
      userId: session.userId,
      dateKey: mission.dateKey,
      priority: mission.priority,
    });

    if (locked) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          message:
            "Complete and verify the previous mission first.",
        },
        { status: 423 }
      );
    }

    // Remove completion created by the previous manual-tick prototype.
    if (mission.completed && !mission.verifiedAt) {
      await prisma.dailyMission.update({
        where: {
          id: mission.id,
        },
        data: {
          completed: false,
          completedAt: null,
        },
      });

      mission = await getOwnedMission(
        missionId,
        session.userId
      );

      if (!mission) {
        throw new Error("Unable to reload mission.");
      }
    }

    let learningContent = mission.learningContent;

    const contentNeedsUpgrade =
      !learningContent ||
      learningContent.lessonTitle.endsWith(
        ": guided mastery lesson"
      ) ||
      learningContent.lessonMarkdown.length < 2500 ||
      learningContent.practiceMarkdown.length < 800;

    if (contentNeedsUpgrade) {
      const lessonInput = {
        missionTitle: mission.title,
        missionDescription: mission.description,
        category: mission.category,
        targetRole: mission.user.targetRole,
        degree:
          mission.user.learnerProfile?.degree ?? null,
        branch:
          mission.user.learnerProfile?.branch ?? null,
      };

      const generated = await generateLesson(lessonInput);

      learningContent =
        await prisma.missionLearningContent.upsert({
          where: { missionId: mission.id },
          update: {
            lessonTitle: generated.lessonTitle,
            objectivesJson: JSON.stringify(
              generated.objectives
            ),
            lessonMarkdown: generated.lessonMarkdown,
            practiceMarkdown:
              generated.practiceMarkdown,
            quizJson: JSON.stringify(generated.quiz),
            sourcesJson: JSON.stringify(
              generated.sources
            ),
          },
          create: {
            missionId: mission.id,
            lessonTitle: generated.lessonTitle,
            objectivesJson: JSON.stringify(
              generated.objectives
            ),
            lessonMarkdown: generated.lessonMarkdown,
            practiceMarkdown:
              generated.practiceMarkdown,
            quizJson: JSON.stringify(generated.quiz),
            sourcesJson: JSON.stringify(
              generated.sources
            ),
          },
        });
    }

    if (!learningContent) {
      throw new Error(
        "Unable to prepare upgraded lesson content."
      );
    }
    if (!mission.startedAt) {
      await prisma.dailyMission.update({
        where: {
          id: mission.id,
        },
        data: {
          startedAt: new Date(),
        },
      });
    }

    const storedQuiz = JSON.parse(
      learningContent.quizJson
    ) as QuizQuestion[];

    const publicQuiz = storedQuiz.map(
      ({ question, options }) => ({
        question,
        options,
      })
    );

    return NextResponse.json({
      success: true,
      locked: false,
      mission: {
        id: mission.id,
        category: mission.category,
        title: mission.title,
        description: mission.description,
        estimatedMinutes: mission.estimatedMinutes,
        requiredScore: mission.requiredScore,
        bestScore: mission.bestScore,
        completed: Boolean(mission.verifiedAt),
        verifiedAt: mission.verifiedAt,
      },
      content: {
        lessonTitle: learningContent.lessonTitle,
        objectives: JSON.parse(
          learningContent.objectivesJson
        ) as string[],
        lessonMarkdown:
          learningContent.lessonMarkdown,
        practiceMarkdown:
          learningContent.practiceMarkdown,
        sources: learningContent.sourcesJson
          ? (JSON.parse(
              learningContent.sourcesJson
            ) as string[])
          : [],
        quiz: publicQuiz,
      },
      attempts: mission.attempts,
    });
  } catch (error) {
    console.error(
      "Learning mission GET error:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to prepare this learning mission.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
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

    const { missionId: missionIdValue } =
      await context.params;

    const missionId = parseMissionId(missionIdValue);

    if (!missionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mission.",
        },
        { status: 400 }
      );
    }

    const mission = await getOwnedMission(
      missionId,
      session.userId
    );

    if (!mission || !mission.learningContent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Start and study the lesson before submitting.",
        },
        { status: 400 }
      );
    }

    const locked = await hasBlockingMission({
      missionId: mission.id,
      userId: session.userId,
      dateKey: mission.dateKey,
      priority: mission.priority,
    });

    if (locked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verify the previous mission first.",
        },
        { status: 423 }
      );
    }

    const body = (await request.json()) as {
      answers?: unknown;
    };

    if (!Array.isArray(body.answers)) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz answers are required.",
        },
        { status: 400 }
      );
    }

    const quiz = JSON.parse(
      mission.learningContent.quizJson
    ) as QuizQuestion[];

    if (
      body.answers.length !== quiz.length ||
      body.answers.some(
        (answer) =>
          !Number.isInteger(Number(answer))
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Answer every quiz question.",
        },
        { status: 400 }
      );
    }

    const answers = body.answers.map(Number);

    const correctCount = quiz.reduce(
      (count, question, index) =>
        answers[index] === question.correctAnswer
          ? count + 1
          : count,
      0
    );

    const score = Math.round(
      (correctCount / quiz.length) * 100
    );

    const passed = score >= mission.requiredScore;
    const bestScore = Math.max(
      mission.bestScore,
      score
    );

    const incorrectFeedback = quiz
      .map((question, index) => ({
        correct:
          answers[index] === question.correctAnswer,
        question: question.question,
        explanation: question.explanation,
      }))
      .filter((item) => !item.correct)
      .map(
        (item) =>
          `${item.question}: ${item.explanation}`
      );

    const feedback = passed
      ? `Verified with ${score}%. Excellent work. The next mission is now unlocked.`
      : `You scored ${score}%. Review these concepts and try again: ${incorrectFeedback.join(
          " | "
        )}`;

    const verifiedAt =
      passed && !mission.verifiedAt
        ? new Date()
        : mission.verifiedAt;

    await prisma.$transaction([
      prisma.missionAttempt.create({
        data: {
          missionId: mission.id,
          userId: session.userId,
          answersJson: JSON.stringify(answers),
          score,
          passed,
          feedback,
        },
      }),
      prisma.dailyMission.update({
        where: {
          id: mission.id,
        },
        data: {
          bestScore,
          completed:
            passed || Boolean(mission.verifiedAt),
          completedAt:
            passed && !mission.completedAt
              ? new Date()
              : mission.completedAt,
          verifiedAt,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      score,
      passed,
      requiredScore: mission.requiredScore,
      bestScore,
      feedback,
      nextMissionUnlocked: passed,
    });
  } catch (error) {
    console.error(
      "Learning mission POST error:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify this learning mission.",
      },
      { status: 500 }
    );
  }
}
