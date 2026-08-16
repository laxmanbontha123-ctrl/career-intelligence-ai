import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const database = await prisma.$queryRaw<
      Array<{
        db: string | null;
        host: string | null;
        port: number | null;
      }>
    >`
      SELECT
        DATABASE() AS db,
        @@hostname AS host,
        @@port AS port
    `;

    const tables = await prisma.$queryRaw<
      Array<{ TABLE_NAME: string }>
    >`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'User',
          'LearnerProfile',
          'UserSettings',
          'Opportunity',
          'OpportunitySkill',
          'SavedOpportunity'
        )
      ORDER BY TABLE_NAME
    `;

    const columns = await prisma.$queryRaw<
      Array<{ COLUMN_NAME: string }>
    >`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'User'
        AND COLUMN_NAME = 'avatarDataUrl'
    `;

    const migrations = await prisma.$queryRaw<
      Array<{ migration_name: string; finished_at: Date | null }>
    >`
      SELECT migration_name, finished_at
      FROM _prisma_migrations
      ORDER BY started_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      database: database[0]?.db ?? null,
      host: database[0]?.host ?? null,
      port: database[0]?.port ? Number(database[0].port) : null,
      tables: tables.map((row) => row.TABLE_NAME),
      avatarDataUrlExists: columns.length > 0,
      recentMigrations: migrations,
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


