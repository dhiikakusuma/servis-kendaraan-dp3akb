"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArchiveRestore, ArchiveX, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { VerifStatusBadge } from "./status-badge";
import { toast } from "./ui/toast";

export type InboxItem = {
  id: string;
  detailKerusakan: string;
  statusVerifikasi: string;
  tanggalPengajuan: string;
  verifiedAt: string | null;
  archivedAt: string | null;
  user: { namaLengkap: string; unitKerja: string | null };
  kendaraan: { platNomor: string; merkModel: string };
};

type Props = {
  items: InboxItem[];
  view: "active" | "archive";
};

function formatTanggal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VerifikatorInboxList({ items, view }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<null | "delete" | "archive" | "unarchive">(null);

  const allChecked = items.length > 0 && selected.size === items.length;
  const partialChecked = selected.size > 0 && !allChecked;

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }

  async function runBulk(action: "delete" | "archive" | "unarchive") {
    if (selectedIds.length === 0) {
      toast.error("Pilih minimal satu pengajuan terlebih dahulu");
      return;
    }
    if (action === "delete") {
      const ok = window.confirm(
        `Hapus ${selectedIds.length} pengajuan terpilih? Tindakan ini tidak dapat dibatalkan.`,
      );
      if (!ok) return;
    }
    setBusy(action);
    try {
      const res = await fetch("/api/pengajuan/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal memproses");
      const verb =
        action === "delete"
          ? "dihapus"
          : action === "archive"
            ? "diarsipkan"
            : "dipulihkan";
      toast.success(`${json.count ?? selectedIds.length} pengajuan berhasil ${verb}`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-zinc-500">
          {view === "archive"
            ? "Tidak ada pengajuan yang diarsipkan."
            : "Tidak ada pengajuan pada kategori ini."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = partialChecked;
            }}
            onChange={toggleAll}
            aria-label="Pilih semua"
          />
          {selected.size > 0
            ? `${selected.size} dari ${items.length} dipilih`
            : `Pilih semua (${items.length})`}
        </label>
        <div className="flex flex-wrap gap-2">
          {view === "active" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selected.size === 0 || busy !== null}
              onClick={() => runBulk("archive")}
            >
              <ArchiveX className="h-4 w-4" />
              {busy === "archive" ? "Mengarsipkan..." : "Arsipkan"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selected.size === 0 || busy !== null}
              onClick={() => runBulk("unarchive")}
            >
              <ArchiveRestore className="h-4 w-4" />
              {busy === "unarchive" ? "Memulihkan..." : "Pulihkan"}
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={selected.size === 0 || busy !== null}
            onClick={() => runBulk("delete")}
          >
            <Trash2 className="h-4 w-4" />
            {busy === "delete" ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
      <ul className="divide-y divide-zinc-100">
        {items.map((p) => {
          const checked = selected.has(p.id);
          return (
            <li
              key={p.id}
              className={`flex items-center gap-3 p-5 transition-colors ${
                checked ? "bg-brand-50/50" : "hover:bg-zinc-50"
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                checked={checked}
                onChange={() => toggle(p.id)}
                aria-label={`Pilih pengajuan ${p.kendaraan.platNomor}`}
              />
              <Link
                href={`/verifikator/pengajuan/${p.id}`}
                className="flex flex-1 items-center justify-between min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-zinc-900">
                      {p.kendaraan.platNomor} · {p.kendaraan.merkModel}
                    </p>
                    <VerifStatusBadge status={p.statusVerifikasi} />
                    {p.archivedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        Arsip
                      </span>
                    )}
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
                    {p.verifiedAt && ` · Diverifikasi ${formatTanggal(p.verifiedAt)}`}
                    {p.archivedAt && ` · Diarsipkan ${formatTanggal(p.archivedAt)}`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 ml-2 flex-shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
