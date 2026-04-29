import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatTanggal } from "@/lib/utils";

export default async function InboxKasubag({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");
  const { status } = await searchParams;

  const where: { status?: string } = {};
  if (status && ["menunggu", "disetujui", "ditolak"].includes(status)) {
    where.status = status;
  } else {
    where.status = "menunggu";
  }

  const list = await prisma.pengajuan.findMany({
    where,
    include: { user: true, kendaraan: true },
    orderBy: { tanggalPengajuan: "desc" },
  });

  const tabs = [
    { key: "menunggu", label: "Menunggu" },
    { key: "disetujui", label: "Disetujui" },
    { key: "ditolak", label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Inbox Pengajuan</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Pengajuan Service
        </h1>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-200">
        {tabs.map((t) => {
          const active = where.status === t.key;
          return (
            <Link
              key={t.key}
              href={`/kasubag/pengajuan?status=${t.key}`}
              className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-500">Tidak ada pengajuan pada kategori ini.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {list.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/kasubag/pengajuan/${p.id}`}
                    className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-zinc-900">
                          {p.kendaraan.platNomor} · {p.kendaraan.merkModel}
                        </p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        <strong>{p.user.namaLengkap}</strong>
                        {p.user.unitKerja && ` · ${p.user.unitKerja}`}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {p.detailKerusakan}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Diajukan {formatTanggal(p.tanggalPengajuan)}
                        {p.tanggalPutusan && ` · Diputuskan ${formatTanggal(p.tanggalPutusan)}`}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 ml-2 flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
