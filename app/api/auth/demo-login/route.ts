import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const DEMO_PHONE = "+919999999999";
const DEMO_OTP = "123456";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone =
      typeof body.phone === "string"
        ? body.phone.replace(/\D/g, "")
        : "";

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    if (phone !== "9999999999" || otp !== DEMO_OTP) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid demo credentials.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.upsert({
      where: {
        authUid: "demo-phone-user",
      },
      update: {
        phone: DEMO_PHONE,
        authMethod: "phone",
      },
      create: {
        authUid: "demo-phone-user",
        name: "Demo Learner",
        email: null,
        phone: DEMO_PHONE,
        role: "student",
        authMethod: "phone",
        profileCompleted: true,
        targetRole: "Cloud / DevOps Engineer",
        readinessScore: 33,
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Demo login successful.",
    });
  } catch (error) {
    console.error("Demo login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Demo login failed.",
      },
      { status: 500 }
    );
  }
}
