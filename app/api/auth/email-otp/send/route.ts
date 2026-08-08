import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { mailer } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Valid email is required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOtp.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const otpRecord = await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    });

    try {
      await mailer.sendMail({
        from: `"CareerIntel AI" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: "Your CareerIntel AI verification code",
        text: `Your CareerIntel AI verification code is ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#0b1020;color:#ffffff;border-radius:16px;">
            <h2 style="margin-top:0;color:#67e8f9;">CareerIntel AI</h2>

            <p style="font-size:16px;color:#dbeafe;">
              Use the verification code below to continue:
            </p>

            <div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;margin:24px 0;background:#111a33;border-radius:12px;color:#ffffff;">
              ${otp}
            </div>

            <p style="color:#94a3b8;">
              This code expires in 10 minutes.
            </p>

            <p style="color:#94a3b8;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      await prisma.emailOtp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      throw mailError;
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Email OTP send error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send verification code.",
      },
      { status: 500 }
    );
  }
}