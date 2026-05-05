"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SignatureNameField } from "@/components/ui/signature-name";
import { toast } from "@/components/ui/toast";
import { formatTanggal } from "@/lib/utils";
import { downloadSuratPengantar, type PengajuanForPdf } from "@/lib/pdf-generator";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Loader2,
  Trash2,
  User as UserIcon,
  XCircle,
} from "lucide-react";

type P = {
  id: string;
  nomorSurat: string | null;
  status: string;
  statusVerifikasi: string;
  catatanVerifikator: string | null;
  verifiedAt: string | null;
  detailKerusakan: string;
  tanggalRencana: string;
  tanggalPengajuan: string;
  tanggalPutusan: string | null;
  alasanPenolakan: string | null;
  rekananNama: string | null;
  ttdPemohon: string | null;
  ttdKasubag: string | null;
  user: {
    id: string;
    namaLengkap: string;
    nip: string | null;
    unitKerja: string | null;
  };
  verifikator: {
    id: string;
    namaLengkap: string;
    nip: string | null;
    jabatan: string | null;
  } | null;
  kasubag: {
    id: string;
    namaLengkap: string;
    nip: string | null;
    jabatan: string | null;
  } | null;
  kendaraan: {
    id: string;
    platNomor: string;
    merkModel: string;
    jenisKendaraan: string;
    tahunPembelian: number | null;
    statusKendaraan: string;
  };
};

export function PengajuanDetailView({
  pengajuan,
  viewerRole,
}: {
  pengajuan: P;
  viewerRole: "pemohon" | "verifikator" | "kasubag";
}) {
  const router = useRouter();
  const [ttdKasubag, setTtdKasubag] = useState("");
  const [alasan, setAlasan] = useState("");
  const [catatanVerif, setCatatanVerif] = useState("");
  const [busy, setBusy] = useState<
    false | "approve" | "reject" | "delete" | "verify-approve" | "verify-reject"
  >(false);
  const [mode, setMode] = useState<"view" | "reject" | "verify-reject">("view");

  const canVerify =
    viewerRole === "verifikator" &&
    pengajuan.statusVerifikasi === "menunggu_verifikasi" &&
    pengajuan.status === "menunggu";
  const canDecide =
    viewerRole === "kasubag" &&
    pengajuan.status === "menunggu" &&
    pengajuan.statusVerifikasi === "diverifikasi";
  const canDelete = viewerRole === "pemohon" && pengajuan.status === "menunggu";

  const handleApprove = async () => {
    if (!ttdKasubag.trim()) {
      toast.error("Nama tanda tangan kasubag wajib diisi");
      return;
    }
    setBusy("approve");
    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ttdKasubag: ttdKasubag.trim() }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal menyetujui");
      toast.success("Pengajuan disetujui dan surat siap dicetak");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!alasan.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setBusy("reject");
    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alasanPenolakan: alasan.trim() }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal menolak");
      toast.success("Pengajuan ditolak");
      setMode("view");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyApprove = async () => {
    if (!catatanVerif.trim()) {
      toast.error("Catatan verifikator wajib diisi");
      return;
    }
    setBusy("verify-approve");
    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "approve", catatan: catatanVerif.trim() }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal verifikasi");
      toast.success("Diverifikasi & diteruskan ke kasubag");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal verifikasi");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyReject = async () => {
    if (!catatanVerif.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setBusy("verify-reject");
    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reject", catatan: catatanVerif.trim() }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal menolak");
      toast.success("Pengajuan ditolak verifikator");
      setMode("view");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus pengajuan ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Pengajuan dihapus");
      router.replace(viewerRole === "pemohon" ? "/pemohon" : "/kasubag");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    const p: PengajuanForPdf = {
      id: pengajuan.id,
      nomorSurat: pengajuan.nomorSurat,
      detailKerusakan: pengajuan.detailKerusakan,
      tanggalRencana: pengajuan.tanggalRencana,
      tanggalPengajuan: pengajuan.tanggalPengajuan,
      tanggalPutusan: pengajuan.tanggalPutusan,
      rekananNama: pengajuan.rekananNama,
      ttdPemohon: pengajuan.ttdPemohon,
      ttdKasubag: pengajuan.ttdKasubag,
      user: pengajuan.user,
      kasubag: pengajuan.kasubag,
      kendaraan: pengajuan.kendaraan,
    };
    downloadSuratPengantar(p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Detail Pengajuan</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
            {pengajuan.kendaraan.platNomor}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {pengajuan.kendaraan.merkModel} · Diajukan {formatTanggal(pengajuan.tanggalPengajuan)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={pengajuan.status} />
          {pengajuan.nomorSurat && (
            <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md">
              {pengajuan.nomorSurat}
            </span>
          )}
        </div>
      </div>

      {/* Verifikasi status timeline */}
      {pengajuan.statusVerifikasi === "menunggu_verifikasi" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <ClipboardCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900">
              Menunggu verifikasi
            </p>
            <p className="text-sm text-amber-800 mt-0.5">
              Pengajuan akan diteruskan ke kasubag setelah diverifikasi.
            </p>
          </div>
        </div>
      )}
      {pengajuan.statusVerifikasi === "diverifikasi" && pengajuan.catatanVerifikator && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-sky-900">
              Telah diverifikasi
              {pengajuan.verifikator && ` oleh ${pengajuan.verifikator.namaLengkap}`}
              {pengajuan.verifiedAt && ` · ${formatTanggal(pengajuan.verifiedAt)}`}
            </p>
            <p className="text-sm text-sky-800 mt-0.5 whitespace-pre-wrap">
              <span className="font-medium">Catatan:</span> {pengajuan.catatanVerifikator}
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {pengajuan.status === "ditolak" && pengajuan.alasanPenolakan && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-900">Pengajuan ditolak</p>
            <p className="text-sm text-red-800 mt-0.5">{pengajuan.alasanPenolakan}</p>
          </div>
        </div>
      )}
      {pengajuan.status === "disetujui" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-emerald-900">Pengajuan disetujui</p>
              <p className="text-sm text-emerald-800 mt-0.5">
                Unduh surat pengantar PDF untuk dibawa ke bengkel rekanan.
              </p>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="h-4 w-4" /> Unduh Surat PDF
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-4 w-4 text-zinc-500" /> Kendaraan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Plat Nomor" value={pengajuan.kendaraan.platNomor} />
            <InfoRow label="Jenis" value={pengajuan.kendaraan.jenisKendaraan} />
            <InfoRow label="Merk/Model" value={pengajuan.kendaraan.merkModel} />
            <InfoRow label="Tahun" value={pengajuan.kendaraan.tahunPembelian?.toString() ?? "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-zinc-500" /> Pemohon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Nama" value={pengajuan.user.namaLengkap} />
            <InfoRow label="NIP" value={pengajuan.user.nip ?? "-"} />
            <InfoRow label="Unit Kerja" value={pengajuan.user.unitKerja ?? "-"} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-500" /> Detail Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                Detail Kerusakan
              </p>
              <p className="whitespace-pre-wrap">{pengajuan.detailKerusakan}</p>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Calendar className="h-4 w-4" />
              Rencana Service: <strong>{formatTanggal(pengajuan.tanggalRencana)}</strong>
            </div>
          </CardContent>
        </Card>

        <SignatureCard
          title="TTD Pemohon"
          name={pengajuan.user.namaLengkap}
          nip={pengajuan.user.nip}
          ttdNama={pengajuan.ttdPemohon}
        />
        <SignatureCard
          title="TTD Kasubag"
          name={pengajuan.kasubag?.namaLengkap ?? "(Belum ditandatangani)"}
          nip={pengajuan.kasubag?.nip ?? null}
          ttdNama={pengajuan.ttdKasubag}
        />
      </div>

      {/* Kasubag waiting for verifikasi */}
      {viewerRole === "kasubag" &&
        pengajuan.status === "menunggu" &&
        pengajuan.statusVerifikasi === "menunggu_verifikasi" && (
          <Card>
            <CardHeader>
              <CardTitle>Menunggu Verifikator</CardTitle>
              <CardDescription>
                Pengajuan ini belum diverifikasi. Tindakan kasubag tersedia setelah
                verifikator menerima pengajuan.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

      {/* Verifikator actions */}
      {canVerify && mode === "view" && (
        <Card>
          <CardHeader>
            <CardTitle>Tindakan Verifikator</CardTitle>
            <CardDescription>
              Centang verifikasi dengan catatan, atau tolak jika pengajuan tidak valid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="catatan-verif"
                className="text-sm font-medium text-zinc-900"
              >
                Catatan Verifikasi
              </label>
              <Textarea
                id="catatan-verif"
                placeholder="Contoh: Data kendaraan & detail kerusakan sudah sesuai. Diteruskan ke kasubag untuk persetujuan."
                rows={4}
                value={catatanVerif}
                onChange={(e) => setCatatanVerif(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Catatan ini akan terlihat oleh kasubag dan pemohon.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:flex-wrap">
              <Button
                onClick={handleVerifyApprove}
                disabled={!catatanVerif.trim() || busy !== false}
              >
                {busy === "verify-approve" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Verifikasi & Teruskan ke Kasubag
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={() => setMode("verify-reject")}>
                <XCircle className="h-4 w-4" /> Tolak Pengajuan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canVerify && mode === "verify-reject" && (
        <Card>
          <CardHeader>
            <CardTitle>Alasan Penolakan</CardTitle>
            <CardDescription>
              Pengajuan tidak akan diteruskan ke kasubag. Pemohon akan melihat alasan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Contoh: Plat nomor tidak terdaftar di aset dinas. Mohon ajukan ulang dengan kendaraan yang benar."
              rows={4}
              value={catatanVerif}
              onChange={(e) => setCatatanVerif(e.target.value)}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="destructive"
                onClick={handleVerifyReject}
                disabled={busy !== false || !catatanVerif.trim()}
              >
                {busy === "verify-reject" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menolak...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" /> Konfirmasi Tolak
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setMode("view")}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kasubag actions */}
      {canDecide && mode === "view" && (
        <Card>
          <CardHeader>
            <CardTitle>Tindakan Kasubag</CardTitle>
            <CardDescription>
              Setujui dengan tanda tangan digital, atau tolak dengan alasan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SignatureNameField
              value={ttdKasubag}
              onChange={setTtdKasubag}
              placeholder="Nama lengkap kasubag"
              hint="Nama akan tampil sebagai tanda tangan persetujuan di surat pengantar."
            />
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:flex-wrap">
              <Button onClick={handleApprove} disabled={!ttdKasubag.trim() || busy !== false}>
                {busy === "approve" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyetujui...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Setujui & Generate Surat
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={() => setMode("reject")}>
                <XCircle className="h-4 w-4" /> Tolak Pengajuan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canDecide && mode === "reject" && (
        <Card>
          <CardHeader>
            <CardTitle>Alasan Penolakan</CardTitle>
            <CardDescription>
              Berikan alasan yang jelas agar pemohon dapat memperbaiki pengajuan berikutnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Contoh: Data kendaraan belum terdaftar di daftar aset dinas. Mohon konfirmasi ulang ke bagian perlengkapan."
              rows={4}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="destructive" onClick={handleReject} disabled={busy !== false || !alasan.trim()}>
                {busy === "reject" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menolak...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" /> Konfirmasi Tolak
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setMode("view")}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pemohon delete */}
      {canDelete && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleDelete} disabled={busy !== false}>
            <Trash2 className="h-4 w-4" /> Tarik / Hapus Pengajuan
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SignatureCard({
  title,
  name,
  nip,
  ttdNama,
}: {
  title: string;
  name: string;
  nip: string | null;
  ttdNama: string | null;
}) {
  // Existing signatures saved as base64 PNG are gracefully replaced with the signer's name text.
  const isLegacyImage = ttdNama?.startsWith("data:image");
  const display = !ttdNama || isLegacyImage ? null : ttdNama;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/60 h-28 flex items-center justify-center px-3">
          {display ? (
            <p
              className="text-2xl sm:text-3xl text-brand-900 italic text-center"
              style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}
            >
              {display}
            </p>
          ) : (
            <span className="text-xs text-zinc-400">Belum ada tanda tangan</span>
          )}
        </div>
        <div className="mt-3 text-sm">
          <p className="font-semibold">{name}</p>
          {nip && <p className="text-xs text-zinc-500">NIP. {nip}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
