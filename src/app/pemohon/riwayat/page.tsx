import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatTanggal } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function RiwayatPemohon() {
  const user = await getSessionUser();
  if (!user) redirect("/login/pemohon");

  const list = await prisma.pengajuan.findMany({
    where: { userId: user.id },
    include: { kendaraan: true },
    orderBy: { tanggalPengajuan: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Riwayat Pengajuan</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Semua Pengajuan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {list.length} pengajuan total
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-500">Belum ada pengajuan.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {list.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pemohon/pengajuan/${p.id}`}
                    className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-zinc-900">
                          {p.kendaraan.platNomor} · {p.kendaraan.merkModel}
                        </p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
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
