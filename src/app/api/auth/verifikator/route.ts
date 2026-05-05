import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password = String(body.password ?? "");
  if (!password) {
    return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: { role: "verifikator" },
  });
  for (const u of users) {
    if (!u.passwordHash) continue;
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (ok) {
      await setSession(u.id);
      return NextResponse.json({ user: u });
    }
  }

  return NextResponse.json({ error: "Password salah" }, { status: 401 });
}
