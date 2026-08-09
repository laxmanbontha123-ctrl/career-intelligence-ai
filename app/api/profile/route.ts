import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
      institution,
      degree,
      branch,
      currentYear,
      cgpa,
      graduationYear,
      experienceLevel,
      preferredWorkMode,
      location,
      bio,
      targetRole,
    } = body;

    if (
      !institution ||
      !degree ||
      !branch ||
      !currentYear ||
      !targetRole
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const yearNumber = Number(currentYear);
    const cgpaNumber =
      cgpa === "" || cgpa === null || cgpa === undefined
        ? null
        : Number(cgpa);

    const graduationYearNumber =
      graduationYear === "" ||
      graduationYear === null ||
      graduationYear === undefined
        ? null
        : Number(graduationYear);

    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < 1 ||
      yearNumber > 6
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Current year is invalid.",
        },
        { status: 400 }
      );
    }

    if (
      cgpaNumber !== null &&
      (Number.isNaN(cgpaNumber) ||
        cgpaNumber < 0 ||
        cgpaNumber > 10)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "CGPA must be between 0 and 10.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.learnerProfile.upsert({
        where: {
          userId: session.userId,
        },
        update: {
          institution: institution.trim(),
          degree: degree.trim(),
          branch: branch.trim(),
          currentYear: yearNumber,
          cgpa: cgpaNumber,
          graduationYear: graduationYearNumber,
          experienceLevel: experienceLevel || null,
          preferredWorkMode: preferredWorkMode || null,
          location: location?.trim() || null,
          bio: bio?.trim() || null,
        },
        create: {
          userId: session.userId,
          institution: institution.trim(),
          degree: degree.trim(),
          branch: branch.trim(),
          currentYear: yearNumber,
          cgpa: cgpaNumber,
          graduationYear: graduationYearNumber,
          experienceLevel: experienceLevel || null,
          preferredWorkMode: preferredWorkMode || null,
          location: location?.trim() || null,
          bio: bio?.trim() || null,
        },
      }),

      prisma.user.update({
        where: {
          id: session.userId,
        },
        data: {
          targetRole: targetRole.trim(),
          profileCompleted: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Learner profile completed successfully.",
    });
  } catch (error) {
    console.error("Profile save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save learner profile.",
      },
      { status: 500 }
    );
  }
}