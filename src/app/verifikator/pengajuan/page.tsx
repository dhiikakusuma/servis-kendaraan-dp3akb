import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  VerifikatorInboxList,
  type InboxItem,
} from "@/components/verifikator-inbox-list";

const TAB_KEYS = [
  "menunggu_verifikasi",
  "diverifikasi",
  "ditolak_verifikator",
  "arsip",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: { key: TabKey; label: string }[] = [
  { key: "menunggu_verifikasi", label: "Menunggu" },
  { key: "diverifikasi", label: "Sudah Diverifikasi" },
  { key: "ditolak_verifikator", label: "Ditolak" },
  { key: "arsip", label: "Arsip" },
];

export default async function InboxVerifikator({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login/verifikator");
  const { status } = await searchParams;

  const filter: TabKey =
    status && (TAB_KEYS as readonly string[]).includes(status)
      ? (status as TabKey)
      : "menunggu_verifikasi";

  const where =
    filter === "arsip"
      ? { archivedAt: { not: null } }
      : { statusVerifikasi: filter, archivedAt: null };

  const list = await prisma.pengajuan.findMany({
    where,
    include: { user: true, kendaraan: true },
    orderBy: { tanggalPengajuan: "desc" },
  });

  const [archivedCount, pendingCount] = await Promise.all([
    prisma.pengajuan.count({ where: { archivedAt: { not: null } } }),
    prisma.pengajuan.count({
      where: { statusVerifikasi: "menunggu_verifikasi", archivedAt: null },
    }),
  ]);

  const items: InboxItem[] = list.map((p) => ({
    id: p.id,
    detailKerusakan: p.detailKerusakan,
    statusVerifikasi: p.statusVerifikasi,
    tanggalPengajuan: p.tanggalPengajuan.toISOString(),
    verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
    archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
    user: { namaLengkap: p.user.namaLengkap, unitKerja: p.user.unitKerja },
    kendaraan: { platNomor: p.kendaraan.platNomor, merkModel: p.kendaraan.merkModel },
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Inbox Verifikator</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Pengajuan Service
        </h1>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto">
        {TABS.map((t) => {
          const active = filter === t.key;
          const badgeCount =
            t.key === "menunggu_verifikasi"
              ? pendingCount
              : t.key === "arsip"
                ? archivedCount
                : null;
          return (
            <Link
              key={t.key}
              href={`/verifikator/pengajuan?status=${t.key}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t.label}
              {badgeCount != null && badgeCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    active ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <VerifikatorInboxList
            items={items}
            view={filter === "arsip" ? "archive" : "active"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
