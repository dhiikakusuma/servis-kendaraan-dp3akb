import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: { userId?: string; status?: string } = {};

  // Pemohon only sees their own
  if (user.role === "pemohon") {
    where.userId = user.id;
  }
  if (status && status !== "semua") {
    where.status = status;
  }

  const list = await prisma.pengajuan.findMany({
    where,
    include: {
      user: { select: { id: true, namaLengkap: true, nip: true, unitKerja: true } },
      kasubag: { select: { id: true, namaLengkap: true, nip: true, jabatan: true } },
      kendaraan: true,
    },
    orderBy: { tanggalPengajuan: "desc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "pemohon") {
    return NextResponse.json({ error: "Hanya pemohon yang dapat membuat pengajuan" }, { status: 403 });
  }

  const body = await req.json();
  const platNomor = String(body.platNomor ?? "").toUpperCase().trim();
  const merkModel = String(body.merkModel ?? "").trim();
  const jenisKendaraan = String(body.jenisKendaraan ?? "Motor").trim();
  const detailKerusakan = String(body.detailKerusakan ?? "").trim();
  const tanggalRencana = body.tanggalRencana ? new Date(body.tanggalRencana) : null;
  const ttdPemohon = body.ttdPemohon ? String(body.ttdPemohon) : null;
  const rekananNama = body.rekananNama ? String(body.rekananNama).trim() : null;

  if (!platNomor || !detailKerusakan || !tanggalRencana || !ttdPemohon) {
    return NextResponse.json(
      { error: "Plat nomor, detail kerusakan, tanggal rencana, dan tanda tangan wajib diisi" },
      { status: 400 },
    );
  }

  // Find or create kendaraan by plat nomor
  let kendaraan = await prisma.kendaraan.findUnique({ where: { platNomor } });
  if (!kendaraan) {
    kendaraan = await prisma.kendaraan.create({
      data: {
        platNomor,
        merkModel: merkModel || "Belum dicatat",
        jenisKendaraan: jenisKendaraan || "Motor",
        statusKendaraan: "aktif",
        namaPengguna: user.namaLengkap,
      },
    });
  } else if (merkModel && kendaraan.merkModel === "Belum dicatat") {
    kendaraan = await prisma.kendaraan.update({
      where: { id: kendaraan.id },
      data: { merkModel },
    });
  }

  const pengajuan = await prisma.pengajuan.create({
    data: {
      userId: user.id,
      kendaraanId: kendaraan.id,
      detailKerusakan,
      tanggalRencana,
      rekananNama,
      ttdPemohon,
      status: "menunggu",
    },
    include: { user: true, kendaraan: true },
  });

  await prisma.auditLog.create({
    data: {
      pengajuanId: pengajuan.id,
      userId: user.id,
      actorName: user.namaLengkap,
      action: "SUBMIT",
    },
  });

  return NextResponse.json(pengajuan, { status: 201 });
}
