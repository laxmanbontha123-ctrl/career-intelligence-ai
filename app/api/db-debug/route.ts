import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const database = await prisma.$queryRaw<
      Array<{ db: string }>
    >`SELECT DATABASE() AS db`;

    const columns = await prisma.$queryRaw<
      Array<{ COLUMN_NAME: string }>
    >`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'User'
        AND COLUMN_NAME = 'avatarDataUrl'
    `;

    return NextResponse.json({
      success: true,
      database: database[0]?.db ?? null,
      avatarDataUrlExists: columns.length > 0,
    });
  } catch (error) {
    console.error("DB debug error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Database diagnostic failed.",
      },
      { status: 500 }
    );
  }
}
