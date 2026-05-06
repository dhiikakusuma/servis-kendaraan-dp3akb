import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Idempotent helper untuk meng-apply schema migration yang belum sempat
 * dijalankan di Postgres production (Vercel build hanya `prisma generate`).
 *
 * Aman dipanggil berulang kali — semua statement memakai `IF NOT EXISTS`.
 */
const STATEMENTS: { name: string; sql: string }[] = [
  {
    name: "pengajuan.archivedAt",
    sql: 'ALTER TABLE "pengajuan" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3)',
  },
];

export async function GET() {
  const applied: string[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const stmt of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(stmt.sql);
      applied.push(stmt.name);
    } catch (err) {
      errors.push({
        name: stmt.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    applied,
    errors,
  });
}
