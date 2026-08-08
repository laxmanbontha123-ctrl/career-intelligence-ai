import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      authUid,
      name,
      email,
      phone,
      authMethod,
    } = body;

    if (!authUid) {
      return NextResponse.json(
        {
          success: false,
          message: "authUid is required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: {
        authUid,
      },

      update: {
        name: name || null,
        email: email || null,
        phone: phone || null,
        authMethod: authMethod || null,
      },

      create: {
        authUid,
        name: name || null,
        email: email || null,
        phone: phone || null,
        role: "student",
        authMethod: authMethod || null,
        profileCompleted: false,
        targetRole: null,
        readinessScore: 0,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("MySQL user save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save user in MySQL",
      },
      { status: 500 }
    );
  }
}