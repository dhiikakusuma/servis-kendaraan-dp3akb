import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateNomorSurat } from "@/lib/utils";

// Hitung urutan dari NOMOR yang benar-benar sudah ada di DB (bukan count status)
async function nextUrutan(tahun: number): Promise<number> {
  const existing = await prisma.pengajuan.findMany({
    where: { nomorSurat: { endsWith: `/${tahun}/DP3AKB-SKT` } },
    select: { nomorSurat: true },
  });
  const max = existing.reduce((m, p) => {
    const n = parseInt(p.nomorSurat?.split("/")[0] ?? "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return max + 1;
}

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

  // Idempotent: kalau sudah punya nomor, pakai itu; jika belum, generate.
  let nomorSurat = existing.nomorSurat ?? null;
  let pengajuan = null;

  // Retry anti-bentrok (race / dobel klik / data tak sinkron)
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!nomorSurat) {
      const urut = (await nextUrutan(tahun)) + attempt; // tiap retry naik 1
      nomorSurat = generateNomorSurat(urut, tahun);
    }

    try {
      pengajuan = await prisma.pengajuan.update({
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
      break; // sukses
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        nomorSurat = null; // bentrok → generate nomor berikutnya
        continue;
      }
      throw e;
    }
  }

  if (!pengajuan) {
    return NextResponse.json(
      { error: "Gagal menghasilkan nomor surat unik, coba lagi." },
      { status: 409 },
    );
  }

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
