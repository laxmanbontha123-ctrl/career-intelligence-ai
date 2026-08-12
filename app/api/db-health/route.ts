import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      database: "MySQL",
      status: "connected",
      userCount,
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error instanceof Error ? error.message : "Unknown database error"
    );

    return NextResponse.json(
      {
        success: false,
        database: "MySQL",
        status: "connection_failed",
      },
      { status: 500 }
    );
  }
}