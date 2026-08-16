import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

const DEMO_PHONE = "9999999999";
const DEMO_OTP = "123456";
const DEMO_USER_ID = 1;

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

    if (phone !== DEMO_PHONE || otp !== DEMO_OTP) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid demo credentials.",
        },
        { status: 401 }
      );
    }

    await createSession({
      userId: DEMO_USER_ID,
      email: null,
      role: "student",
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
