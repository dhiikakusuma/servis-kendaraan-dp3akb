import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateNomorSurat } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "kasubag" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const ttdKasubag = body.ttdKasubag ? String(body.ttdKasubag) : null;
  if (!ttdKasubag) {
    return NextResponse.json({ error: "Tanda tangan kasubag wajib" }, { status: 400 });
  }

  const existing = await prisma.pengajuan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (existing.status !== "menunggu") {
    return NextResponse.json({ error: "Pengajuan sudah diputuskan" }, { status: 400 });
  }

  const tahun = new Date().getFullYear();
  const countThisYear = await prisma.pengajuan.count({
    where: {
      status: "disetujui",
      tanggalPutusan: { gte: new Date(`${tahun}-01-01`), lt: new Date(`${tahun + 1}-01-01`) },
    },
  });
  const nomorSurat = generateNomorSurat(countThisYear + 1, tahun);

  const pengajuan = await prisma.pengajuan.update({
    where: { id },
    data: {
      status: "disetujui",
      ttdKasubag,
      kasubagId: user.id,
      tanggalPutusan: new Date(),
      nomorSurat,
    },
    include: { user: true, kasubag: true, kendaraan: true },
  });

  await prisma.kendaraan.update({
    where: { id: pengajuan.kendaraanId },
    data: { statusKendaraan: "service", lastServiceDate: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      pengajuanId: id,
      userId: user.id,
      actorName: user.namaLengkap,
      action: "APPROVE",
    },
  });

  return NextResponse.json(pengajuan);
}
