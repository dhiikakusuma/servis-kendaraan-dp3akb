import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ArrowRight, ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifStatusBadge } from "@/components/status-badge";
import { formatTanggal } from "@/lib/utils";

export default async function VerifikatorDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login/verifikator");

  const [counts, pending] = await Promise.all([
    prisma.pengajuan.groupBy({
      by: ["statusVerifikasi"],
      _count: true,
    }),
    prisma.pengajuan.findMany({
      where: { statusVerifikasi: "menunggu_verifikasi" },
      include: { user: true, kendaraan: true },
      orderBy: { tanggalPengajuan: "desc" },
      take: 5,
    }),
  ]);

  const map = Object.fromEntries(
    counts.map((c) => [c.statusVerifikasi, c._count]),
  ) as Record<string, number>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Dashboard Verifikator</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Selamat datang, {user.namaLengkap.split(" ")[0]}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Verifikasi setiap pengajuan service sebelum diteruskan ke kasubag.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Menunggu Verifikasi"
          value={map.menunggu_verifikasi ?? 0}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Sudah Diverifikasi"
          value={map.diverifikasi ?? 0}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Ditolak Verifikator"
          value={map.ditolak_verifikator ?? 0}
          icon={XCircle}
          tone="red"
        />
        <StatCard
          label="Total Diproses"
          value={
            (map.menunggu_verifikasi ?? 0) +
            (map.diverifikasi ?? 0) +
            (map.ditolak_verifikator ?? 0)
          }
          icon={ClipboardCheck}
          tone="zinc"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menunggu Verifikasi</CardTitle>
              <CardDescription>
                {pending.length === 0
                  ? "Tidak ada pengajuan yang menunggu verifikasi"
                  : `${pending.length} pengajuan menunggu tindakan`}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/verifikator/pengajuan">
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center">
              <p className="text-sm text-zinc-500">Semua pengajuan sudah diverifikasi 🎉</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pending.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/verifikator/pengajuan/${p.id}`}
                    className="flex items-center justify-between py-4 hover:bg-zinc-50 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-zinc-900">
                          {p.kendaraan.platNomor} · {p.kendaraan.merkModel}
                        </p>
                        <VerifStatusBadge status={p.statusVerifikasi} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Oleh <strong>{p.user.namaLengkap}</strong>
                        {p.user.unitKerja && ` · ${p.user.unitKerja}`}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {p.detailKerusakan}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {formatTanggal(p.tanggalPengajuan)}
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
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}
