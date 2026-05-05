import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "verifikator" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const action = body.action === "reject" ? "reject" : "approve";
  const catatan = body.catatan ? String(body.catatan).trim() : "";

  if (action === "approve" && !catatan) {
    return NextResponse.json(
      { error: "Catatan verifikator wajib diisi" },
      { status: 400 },
    );
  }
  if (action === "reject" && !catatan) {
    return NextResponse.json(
      { error: "Alasan penolakan wajib diisi" },
      { status: 400 },
    );
  }

  const existing = await prisma.pengajuan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (existing.statusVerifikasi !== "menunggu_verifikasi") {
    return NextResponse.json(
      { error: "Pengajuan sudah diverifikasi sebelumnya" },
      { status: 400 },
    );
  }
  if (existing.status !== "menunggu") {
    return NextResponse.json(
      { error: "Pengajuan sudah diputuskan" },
      { status: 400 },
    );
  }

  if (action === "approve") {
    const pengajuan = await prisma.pengajuan.update({
      where: { id },
      data: {
        statusVerifikasi: "diverifikasi",
        catatanVerifikator: catatan,
        verifiedById: user.id,
        verifiedAt: new Date(),
      },
      include: { user: true, verifikator: true, kendaraan: true },
    });
    await prisma.auditLog.create({
      data: {
        pengajuanId: id,
        userId: user.id,
        actorName: user.namaLengkap,
        action: "VERIFY_APPROVE",
      },
    });
    return NextResponse.json(pengajuan);
  }

  // reject
  const pengajuan = await prisma.pengajuan.update({
    where: { id },
    data: {
      statusVerifikasi: "ditolak_verifikator",
      catatanVerifikator: catatan,
      verifiedById: user.id,
      verifiedAt: new Date(),
      status: "ditolak",
      alasanPenolakan: `[Ditolak Verifikator] ${catatan}`,
      tanggalPutusan: new Date(),
    },
    include: { user: true, verifikator: true, kendaraan: true },
  });
  await prisma.auditLog.create({
    data: {
      pengajuanId: id,
      userId: user.id,
      actorName: user.namaLengkap,
      action: "VERIFY_REJECT",
    },
  });
  return NextResponse.json(pengajuan);
}
