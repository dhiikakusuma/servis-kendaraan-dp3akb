import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, VerifStatusBadge } from "@/components/status-badge";
import { formatTanggal } from "@/lib/utils";
import { ArrowRight, Clock, FileText, PlusCircle, CheckCircle2, XCircle } from "lucide-react";

export default async function PemohonDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login/pemohon");

  const [list, counts] = await Promise.all([
    prisma.pengajuan.findMany({
      where: { userId: user.id },
      include: { kendaraan: true },
      orderBy: { tanggalPengajuan: "desc" },
      take: 5,
    }),
    prisma.pengajuan.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Dashboard Pemohon</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Halo, {user.namaLengkap.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Ajukan pengantar service kendaraan dinas di sini. Status pengajuan kamu tampil di bawah.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Menunggu" value={countMap.menunggu ?? 0} icon={Clock} tone="amber" />
        <StatCard label="Disetujui" value={countMap.disetujui ?? 0} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Ditolak" value={countMap.ditolak ?? 0} icon={XCircle} tone="red" />
        <StatCard
          label="Total Pengajuan"
          value={(countMap.menunggu ?? 0) + (countMap.disetujui ?? 0) + (countMap.ditolak ?? 0)}
          icon={FileText}
          tone="zinc"
        />
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">Butuh service kendaraan?</h2>
          <p className="text-sm text-brand-800/70 mt-1">
            Buat pengajuan baru dalam kurang dari 1 menit.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/pemohon/pengajuan/baru">
            <PlusCircle className="h-4 w-4" /> Pengajuan Baru
          </Link>
        </Button>
      </div>

      {/* Recent */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pengajuan Terbaru</CardTitle>
              <CardDescription>5 pengajuan terakhir kamu</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/pemohon/riwayat">
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center">
              <p className="text-sm text-zinc-500">Belum ada pengajuan. Buat pengajuan pertamamu!</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {list.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pemohon/pengajuan/${p.id}`}
                    className="flex items-center justify-between py-4 hover:bg-zinc-50 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-zinc-900">
                          {p.kendaraan.platNomor} · {p.kendaraan.merkModel}
                        </p>
                        <StatusBadge status={p.status} />
                        {p.status === "menunggu" && (
                          <VerifStatusBadge status={p.statusVerifikasi} />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                        {p.detailKerusakan}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Diajukan {formatTanggal(p.tanggalPengajuan)}
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

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "emerald" | "red" | "zinc";
}) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    zinc: "bg-zinc-100 text-zinc-700",
  };
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{label}</span>
        <div className={`h-8 w-8 rounded-lg ${toneMap[tone]} flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
