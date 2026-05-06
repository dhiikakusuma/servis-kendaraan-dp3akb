import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    user.role !== "kasubag" &&
    user.role !== "admin" &&
    user.role !== "verifikator"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: {
    namaLengkap?: string;
    nip?: string | null;
    unitKerja?: string | null;
    jabatan?: string | null;
    passwordHash?: string;
  } = {};

  if (typeof body.namaLengkap === "string" && body.namaLengkap.trim()) {
    data.namaLengkap = body.namaLengkap.trim();
  }
  if (typeof body.nip === "string") {
    data.nip = body.nip.trim() || null;
  }
  if (typeof body.unitKerja === "string") {
    data.unitKerja = body.unitKerja.trim() || null;
  }
  if (typeof body.jabatan === "string") {
    data.jabatan = body.jabatan.trim() || null;
  }
  if (typeof body.password === "string" && body.password.length >= 4) {
    data.passwordHash = await bcrypt.hash(body.password, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      actorName: updated.namaLengkap,
      action: "UPDATE_PROFIL",
    },
  });

  return NextResponse.json({ user: updated });
}
