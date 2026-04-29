import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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
  const alasan = String(body.alasanPenolakan ?? "").trim();
  if (!alasan) {
    return NextResponse.json({ error: "Alasan penolakan wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.pengajuan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  if (existing.status !== "menunggu") {
    return NextResponse.json({ error: "Pengajuan sudah diputuskan" }, { status: 400 });
  }

  const pengajuan = await prisma.pengajuan.update({
    where: { id },
    data: {
      status: "ditolak",
      alasanPenolakan: alasan,
      kasubagId: user.id,
      tanggalPutusan: new Date(),
    },
    include: { user: true, kasubag: true, kendaraan: true },
  });

  await prisma.auditLog.create({
    data: {
      pengajuanId: id,
      userId: user.id,
      actorName: user.namaLengkap,
      action: "REJECT",
    },
  });

  return NextResponse.json(pengajuan);
}
