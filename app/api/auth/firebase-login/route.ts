import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { idToken, requestedRole } = await request.json();
    const desiredRole = requestedRole === "admin" ? "admin" : "student";

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Firebase ID token is required.",
        },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const authUid = decoded.uid;
    const email =
      typeof decoded.email === "string"
        ? decoded.email.trim().toLowerCase()
        : null;

    const phone =
      typeof decoded.phone_number === "string"
        ? decoded.phone_number
        : null;

    const name =
      typeof decoded.name === "string" && decoded.name.trim()
        ? decoded.name.trim()
        : null;

    const provider = decoded.firebase?.sign_in_provider;

    const authMethod =
      provider === "google.com"
        ? "google"
        : provider === "phone"
          ? "phone"
          : "firebase";

    let user = await prisma.user.findUnique({
      where: {
        authUid,
      },
    });

    if (!user && email) {
      user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    if (!user && phone) {
      user = await prisma.user.findUnique({
        where: {
          phone,
        },
      });
    }

    if (user) {
      if (user.role !== desiredRole) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This account is not authorized for the selected workspace.",
          },
          { status: 403 }
        );
      }

      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          authUid,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(name ? { name } : {}),
          authMethod,
        },
      });
    } else {
      if (desiredRole === "admin") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Administrator access must be provisioned by the platform.",
          },
          { status: 403 }
        );
      }

      user = await prisma.user.create({
        data: {
          authUid,
          name: name ?? "CareerIntel Learner",
          email,
          phone,
          role: "student",
          authMethod,
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
      role: user.role,
      message: "Firebase authentication verified successfully.",
    });
  } catch (error) {
    console.error("Firebase login verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify Firebase authentication.",
      },
      { status: 401 }
    );
  }
}
