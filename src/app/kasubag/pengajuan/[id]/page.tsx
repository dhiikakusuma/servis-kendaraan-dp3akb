import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { PengajuanDetailView } from "@/components/pengajuan-detail-view";

export default async function KasubagPengajuanDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");

  const p = await prisma.pengajuan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, namaLengkap: true, nip: true, unitKerja: true } },
      kasubag: { select: { id: true, namaLengkap: true, nip: true, jabatan: true } },
      kendaraan: true,
    },
  });
  if (!p) notFound();

  const serialized = {
    ...p,
    tanggalPengajuan: p.tanggalPengajuan.toISOString(),
    tanggalRencana: p.tanggalRencana.toISOString(),
    tanggalPutusan: p.tanggalPutusan ? p.tanggalPutusan.toISOString() : null,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/kasubag/pengajuan"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke inbox
      </Link>
      <PengajuanDetailView pengajuan={serialized} viewerRole="kasubag" />
    </div>
  );
}
