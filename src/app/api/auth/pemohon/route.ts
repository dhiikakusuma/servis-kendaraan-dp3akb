import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const namaLengkap = String(body.namaLengkap ?? "").trim();
  if (!namaLengkap) {
    return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
  }

  // Find existing pemohon by exact (case-insensitive) name
  let user = await prisma.user.findFirst({
    where: {
      role: "pemohon",
      namaLengkap: { equals: namaLengkap },
    },
  });

  if (!user) {
    // Case-insensitive fallback
    const all = await prisma.user.findMany({ where: { role: "pemohon" } });
    user =
      all.find((u) => u.namaLengkap.toLowerCase() === namaLengkap.toLowerCase()) ?? null;
  }

  if (!user) {
    // Auto-register new pemohon
    user = await prisma.user.create({
      data: {
        namaLengkap,
        role: "pemohon",
      },
    });
  }

  await setSession(user.id);
  return NextResponse.json({ user });
}
