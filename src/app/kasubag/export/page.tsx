"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatTanggalPendek } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type P = {
  id: string;
  nomorSurat: string | null;
  status: string;
  detailKerusakan: string;
  tanggalRencana: string;
  tanggalPengajuan: string;
  tanggalPutusan: string | null;
  user: { namaLengkap: string; nip: string | null; unitKerja: string | null };
  kasubag: { namaLengkap: string } | null;
  kendaraan: { platNomor: string; merkModel: string; jenisKendaraan: string };
};

export default function ExportPage() {
  const [list, setList] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pengajuan?status=semua")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setList(d);
      })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  const exportExcel = () => {
    const rows = list.map((p) => ({
      "Nomor Surat": p.nomorSurat ?? "",
      "Tanggal Pengajuan": formatTanggalPendek(p.tanggalPengajuan),
      Pemohon: p.user.namaLengkap,
      NIP: p.user.nip ?? "",
      "Unit Kerja": p.user.unitKerja ?? "",
      "Plat Nomor": p.kendaraan.platNomor,
      Jenis: p.kendaraan.jenisKendaraan,
      "Merk/Model": p.kendaraan.merkModel,
      "Detail Kerusakan": p.detailKerusakan.replace(/\n/g, " "),
      "Tanggal Rencana": formatTanggalPendek(p.tanggalRencana),
      Status: p.status,
      Kasubag: p.kasubag?.namaLengkap ?? "",
      "Tanggal Putusan": formatTanggalPendek(p.tanggalPutusan),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 24 },
      { wch: 20 },
      { wch: 26 },
      { wch: 12 },
      { wch: 10 },
      { wch: 22 },
      { wch: 38 },
      { wch: 14 },
      { wch: 12 },
      { wch: 24 },
      { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengajuan");
    XLSX.writeFile(
      workbook,
      `pengajuan-service-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    toast.success("Excel berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Export</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Export Data Pengajuan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Unduh seluruh data pengajuan dalam format Excel (.xlsx) untuk pelaporan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-brand-600" /> Data Pengajuan
              </CardTitle>
              <CardDescription>
                {loading ? "Memuat..." : `${list.length} baris siap diekspor`}
              </CardDescription>
            </div>
            <Button onClick={exportExcel} disabled={loading || list.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Unduh Excel
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-widest">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Nomor Surat</th>
                <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                <th className="text-left px-5 py-3 font-medium">Pemohon</th>
                <th className="text-left px-5 py-3 font-medium">Plat</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-500">
                    Belum ada data.
                  </td>
                </tr>
              )}
              {list.slice(0, 50).map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs">{p.nomorSurat ?? "-"}</td>
                  <td className="px-5 py-3 text-zinc-600">{formatTanggalPendek(p.tanggalPengajuan)}</td>
                  <td className="px-5 py-3">{p.user.namaLengkap}</td>
                  <td className="px-5 py-3 font-medium tabular-nums">{p.kendaraan.platNomor}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length > 50 && (
            <p className="text-xs text-zinc-500 px-5 py-3 border-t border-zinc-100">
              Menampilkan 50 dari {list.length} baris. Ekspor Excel untuk data lengkap.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
