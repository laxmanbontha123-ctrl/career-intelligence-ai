import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

type DemoRole = "student" | "admin";

type DemoAccount = {
  phone: string;
  otp: string;
  userId: number;
  role: DemoRole;
};

const DEMO_ACCOUNTS: Record<DemoRole, DemoAccount> = {
  student: {
    phone: "9999999999",
    otp: "123456",
    userId: 1,
    role: "student",
  },
  admin: {
    phone: "8888888888",
    otp: "654321",
    userId: 4,
    role: "admin",
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: unknown;
      otp?: unknown;
      requestedRole?: unknown;
    };

    const phone =
      typeof body.phone === "string"
        ? body.phone.replace(/\D/g, "")
        : "";

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    let requestedRole: DemoRole;

    if (body.requestedRole === "admin") {
      requestedRole = "admin";
    } else if (body.requestedRole === "student") {
      requestedRole = "student";
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid workspace.",
        },
        { status: 400 }
      );
    }

    const demo = DEMO_ACCOUNTS[requestedRole];

    if (phone !== demo.phone || otp !== demo.otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid demo credentials.",
        },
        { status: 401 }
      );
    }

    await createSession({
      userId: demo.userId,
      email: null,
      role: demo.role,
    });

    return NextResponse.json({
      success: true,
      role: demo.role,
      redirect:
        demo.role === "admin"
          ? "/admin"
          : "/dashboard",
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
