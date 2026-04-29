import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const p = await prisma.pengajuan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, namaLengkap: true, nip: true, unitKerja: true } },
      kasubag: { select: { id: true, namaLengkap: true, nip: true } },
      kendaraan: true,
      auditLogs: { orderBy: { timestamp: "desc" } },
    },
  });
  if (!p) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  if (user.role === "pemohon" && p.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(p);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const p = await prisma.pengajuan.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  if (user.role === "pemohon" && p.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "pemohon" && p.status !== "menunggu") {
    return NextResponse.json({ error: "Pengajuan sudah diputuskan" }, { status: 400 });
  }

  await prisma.auditLog.deleteMany({ where: { pengajuanId: id } });
  await prisma.pengajuan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
