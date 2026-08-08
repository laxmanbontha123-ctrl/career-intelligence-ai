import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (
      !email ||
      typeof email !== "string" ||
      !otp ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid email and 6-digit OTP are required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = await prisma.emailOtp.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      await prisma.emailOtp.update({
        where: { id: record.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await prisma.emailOtp.update({
        where: { id: record.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          success: false,
          message: "OTP expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expectedBuffer = Buffer.from(record.otpHash, "hex");
    const submittedBuffer = Buffer.from(submittedHash, "hex");

    const isValid =
      expectedBuffer.length === submittedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, submittedBuffer);

    if (!isValid) {
      const attempts = record.attempts + 1;

      await prisma.emailOtp.update({
        where: { id: record.id },
        data: {
          attempts,
          used: attempts >= 5,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Incorrect OTP.",
        },
        { status: 400 }
      );
    }

    await prisma.emailOtp.update({
      where: { id: record.id },
      data: {
        used: true,
      },
    });

    let user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      const emailIdentity = crypto
        .createHash("sha256")
        .update(normalizedEmail)
        .digest("hex");

      user = await prisma.user.create({
        data: {
          authUid: `email:${emailIdentity}`,
          email: normalizedEmail,
          name: "CareerIntel Learner",
          role: "student",
          authMethod: "email_otp",
          profileCompleted: false,
          readinessScore: 0,
        },
      });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified and signed in successfully.",
    });
  } catch (error) {
    console.error("Email OTP verify error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify email OTP.",
      },
      { status: 500 }
    );
  }
}