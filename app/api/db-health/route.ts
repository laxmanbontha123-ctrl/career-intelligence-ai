import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorLike = {
  name?: unknown;
  message?: unknown;
  code?: unknown;
  errno?: unknown;
  sqlState?: unknown;
  cause?: unknown;
  meta?: {
    modelName?: unknown;
    driverAdapterError?: unknown;
  };
};

function getSafeErrorDetails(error: unknown, depth = 0): unknown {
  if (!error || typeof error !== "object" || depth > 4) {
    return typeof error === "string" ? error : undefined;
  }

  const value = error as ErrorLike;

  return {
    name: typeof value.name === "string" ? value.name : undefined,
    message:
      typeof value.message === "string" ? value.message : undefined,
    code:
      typeof value.code === "string" ||
      typeof value.code === "number"
        ? value.code
        : undefined,
    errno:
      typeof value.errno === "string" ||
      typeof value.errno === "number"
        ? value.errno
        : undefined,
    sqlState:
      typeof value.sqlState === "string"
        ? value.sqlState
        : undefined,
    modelName:
      typeof value.meta?.modelName === "string"
        ? value.meta.modelName
        : undefined,
    driverAdapterError: value.meta?.driverAdapterError
      ? getSafeErrorDetails(
          value.meta.driverAdapterError,
          depth + 1
        )
      : undefined,
    cause: value.cause
      ? getSafeErrorDetails(value.cause, depth + 1)
      : undefined,
  };
}

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
      "Database health diagnostic:",
      JSON.stringify(getSafeErrorDetails(error), null, 2)
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