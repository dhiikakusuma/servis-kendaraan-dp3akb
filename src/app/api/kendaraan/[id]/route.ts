import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "kasubag" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.merkModel) data.merkModel = String(body.merkModel);
  if (body.jenisKendaraan) data.jenisKendaraan = String(body.jenisKendaraan);
  if (body.namaPengguna !== undefined) data.namaPengguna = body.namaPengguna ? String(body.namaPengguna) : null;
  if (body.tahunPembelian !== undefined) data.tahunPembelian = body.tahunPembelian ? Number(body.tahunPembelian) : null;
  if (body.statusKendaraan) data.statusKendaraan = String(body.statusKendaraan);

  const k = await prisma.kendaraan.update({ where: { id }, data });
  return NextResponse.json(k);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "kasubag" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const usedIn = await prisma.pengajuan.count({ where: { kendaraanId: id } });
  if (usedIn > 0) {
    return NextResponse.json(
      { error: "Kendaraan sudah memiliki riwayat pengajuan dan tidak dapat dihapus" },
      { status: 400 },
    );
  }
  await prisma.kendaraan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
