import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

type BulkAction = "delete" | "archive" | "unarchive";

const VALID_ACTIONS: BulkAction[] = ["delete", "archive", "unarchive"];

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "verifikator" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const ids: unknown = body?.ids;
  const action: unknown = body?.action;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Tidak ada item yang dipilih" }, { status: 400 });
  }
  const idList = ids.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (idList.length === 0) {
    return NextResponse.json({ error: "Daftar id tidak valid" }, { status: 400 });
  }
  if (typeof action !== "string" || !VALID_ACTIONS.includes(action as BulkAction)) {
    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  }

  const items = await prisma.pengajuan.findMany({
    where: { id: { in: idList } },
    select: { id: true },
  });
  const validIds = items.map((i) => i.id);
  if (validIds.length === 0) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  }

  if (action === "delete") {
    await prisma.auditLog.deleteMany({ where: { pengajuanId: { in: validIds } } });
    const result = await prisma.pengajuan.deleteMany({
      where: { id: { in: validIds } },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actorName: user.namaLengkap,
        action: `BULK_DELETE_${result.count}`,
      },
    });
    return NextResponse.json({ success: true, count: result.count });
  }

  if (action === "archive") {
    const result = await prisma.pengajuan.updateMany({
      where: { id: { in: validIds } },
      data: { archivedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actorName: user.namaLengkap,
        action: `BULK_ARCHIVE_${result.count}`,
      },
    });
    return NextResponse.json({ success: true, count: result.count });
  }

  // unarchive
  const result = await prisma.pengajuan.updateMany({
    where: { id: { in: validIds } },
    data: { archivedAt: null },
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      actorName: user.namaLengkap,
      action: `BULK_UNARCHIVE_${result.count}`,
    },
  });
  return NextResponse.json({ success: true, count: result.count });
}
