import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SettingsBody = Record<string, unknown>;

const DEFAULT_SETTINGS = {
  timezone: "Asia/Kolkata",
  dailyGoalMinutes: 60,
  reminderEnabled: true,
  reminderTime: "19:00",
  emailNotifications: true,
  weeklyProgressEmail: true,
  reducedMotion: false,
};

async function getOrCreateSettings(userId: number) {
  return prisma.userSettings.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
      ...DEFAULT_SETTINGS,
    },
  });
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

    const settings = await getOrCreateSettings(session.userId);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Settings load error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your settings.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as SettingsBody;
    const current = await getOrCreateSettings(session.userId);

    const dailyGoalMinutes =
      body.dailyGoalMinutes === undefined
        ? current.dailyGoalMinutes
        : Number(body.dailyGoalMinutes);

    if (
      !Number.isInteger(dailyGoalMinutes) ||
      dailyGoalMinutes < 15 ||
      dailyGoalMinutes > 240
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Daily goal must be between 15 and 240 minutes.",
        },
        { status: 400 }
      );
    }

    const reminderTime =
      body.reminderTime === undefined
        ? current.reminderTime
        : typeof body.reminderTime === "string"
          ? body.reminderTime.trim()
          : "";

    if (
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reminder time must use the HH:MM format.",
        },
        { status: 400 }
      );
    }

    const timezone =
      body.timezone === undefined
        ? current.timezone
        : typeof body.timezone === "string"
          ? body.timezone.trim()
          : "";

    if (
      !timezone ||
      timezone.length > 64 ||
      !/^(?:UTC|[A-Za-z_]+\/[A-Za-z0-9_+\-]+)$/.test(
        timezone
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected timezone is invalid.",
        },
        { status: 400 }
      );
    }

    const booleanFields = [
      "reminderEnabled",
      "emailNotifications",
      "weeklyProgressEmail",
      "reducedMotion",
    ] as const;

    for (const field of booleanFields) {
      if (
        body[field] !== undefined &&
        typeof body[field] !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} must be true or false.`,
          },
          { status: 400 }
        );
      }
    }

    const settings = await prisma.userSettings.update({
      where: {
        userId: session.userId,
      },
      data: {
        timezone,
        dailyGoalMinutes,
        reminderTime,
        reminderEnabled:
          typeof body.reminderEnabled === "boolean"
            ? body.reminderEnabled
            : current.reminderEnabled,
        emailNotifications:
          typeof body.emailNotifications === "boolean"
            ? body.emailNotifications
            : current.emailNotifications,
        weeklyProgressEmail:
          typeof body.weeklyProgressEmail === "boolean"
            ? body.weeklyProgressEmail
            : current.weeklyProgressEmail,
        reducedMotion:
          typeof body.reducedMotion === "boolean"
            ? body.reducedMotion
            : current.reducedMotion,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Settings update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your settings.",
      },
      { status: 500 }
    );
  }
}
