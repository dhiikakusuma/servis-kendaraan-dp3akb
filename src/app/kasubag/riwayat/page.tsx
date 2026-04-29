import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatTanggal } from "@/lib/utils";

export default async function KasubagRiwayat() {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");

  const list = await prisma.pengajuan.findMany({
    where: { status: { in: ["disetujui", "ditolak"] } },
    include: { user: true, kasubag: true, kendaraan: true },
    orderBy: { tanggalPutusan: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Riwayat Keputusan</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Riwayat Pengajuan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {list.length} pengajuan sudah diputuskan
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-500">Belum ada riwayat keputusan.</p>
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
                          {p.nomorSurat ?? p.kendaraan.platNomor}
                        </p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {p.kendaraan.platNomor} · {p.kendaraan.merkModel} · <strong>{p.user.namaLengkap}</strong>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Diputuskan {formatTanggal(p.tanggalPutusan)}
                        {p.kasubag && ` oleh ${p.kasubag.namaLengkap}`}
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
