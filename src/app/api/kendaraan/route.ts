import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await prisma.kendaraan.findMany({ orderBy: { platNomor: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "kasubag" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const platNomor = String(body.platNomor ?? "").toUpperCase().trim();
  const merkModel = String(body.merkModel ?? "").trim();
  const jenisKendaraan = String(body.jenisKendaraan ?? "Motor").trim();
  const namaPengguna = body.namaPengguna ? String(body.namaPengguna) : null;
  const tahunPembelian = body.tahunPembelian ? Number(body.tahunPembelian) : null;
  if (!platNomor || !merkModel) {
    return NextResponse.json({ error: "Plat nomor dan merk/model wajib" }, { status: 400 });
  }

  const existing = await prisma.kendaraan.findUnique({ where: { platNomor } });
  if (existing) {
    return NextResponse.json({ error: "Kendaraan sudah terdaftar" }, { status: 409 });
  }

  const k = await prisma.kendaraan.create({
    data: {
      platNomor,
      merkModel,
      jenisKendaraan,
      namaPengguna,
      tahunPembelian: tahunPembelian ?? null,
    },
  });
  return NextResponse.json(k, { status: 201 });
}
