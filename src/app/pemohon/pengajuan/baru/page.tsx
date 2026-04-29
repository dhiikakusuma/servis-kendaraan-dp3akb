"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SignaturePadField } from "@/components/ui/signature-pad";
import { toast } from "@/components/ui/toast";

type Kendaraan = {
  id: string;
  platNomor: string;
  merkModel: string;
  jenisKendaraan: string;
};

export default function FormPengajuanBaru() {
  const router = useRouter();
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);
  const [platNomor, setPlatNomor] = useState("");
  const [merkModel, setMerkModel] = useState("");
  const [jenisKendaraan, setJenisKendaraan] = useState("Motor");
  const [detailKerusakan, setDetailKerusakan] = useState("");
  const [tanggalRencana, setTanggalRencana] = useState("");
  const [ttdPemohon, setTtdPemohon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/kendaraan")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setKendaraanList(data);
      })
      .catch(() => {});
  }, []);

  const onPickKendaraan = (plat: string) => {
    setPlatNomor(plat);
    const found = kendaraanList.find((k) => k.platNomor === plat);
    if (found) {
      setMerkModel(found.merkModel);
      setJenisKendaraan(found.jenisKendaraan);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platNomor.trim() || !detailKerusakan.trim() || !tanggalRencana || !ttdPemohon) {
      toast.error("Semua field wajib diisi termasuk tanda tangan");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengajuan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          platNomor: platNomor.trim().toUpperCase(),
          merkModel: merkModel.trim(),
          jenisKendaraan,
          detailKerusakan: detailKerusakan.trim(),
          tanggalRencana,
          ttdPemohon,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengirim pengajuan");
      toast.success("Pengajuan berhasil dikirim");
      router.replace(`/pemohon/pengajuan/${json.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pengajuan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/pemohon"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
      </Link>

      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Pengajuan Baru</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          Ajukan Service Kendaraan
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Isi data berikut dan berikan tanda tangan digital.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Kendaraan</CardTitle>
            <CardDescription>
              Pilih dari daftar kendaraan dinas, atau input plat nomor manual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {kendaraanList.length > 0 && (
              <div className="space-y-2">
                <Label>Pilih kendaraan terdaftar</Label>
                <div className="flex flex-wrap gap-2">
                  {kendaraanList.map((k) => (
                    <button
                      type="button"
                      key={k.id}
                      onClick={() => onPickKendaraan(k.platNomor)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        platNomor === k.platNomor
                          ? "border-brand-600 bg-brand-50 text-brand-800"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {k.platNomor} · {k.merkModel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="plat">Plat Nomor *</Label>
                <Input
                  id="plat"
                  placeholder="KT 1234 CD"
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jenis">Jenis Kendaraan</Label>
                <select
                  id="jenis"
                  value={jenisKendaraan}
                  onChange={(e) => setJenisKendaraan(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option>Motor</option>
                  <option>Mobil</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="merk">Merk / Model</Label>
                <Input
                  id="merk"
                  placeholder="Honda Vario 150"
                  value={merkModel}
                  onChange={(e) => setMerkModel(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail Kerusakan & Rencana</CardTitle>
            <CardDescription>
              Jelaskan kerusakan / kebutuhan service, dan kapan rencana dibawa ke bengkel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="detail">Detail Kerusakan / Kebutuhan Service *</Label>
              <Textarea
                id="detail"
                rows={4}
                placeholder="Contoh: Ganti oli, tune up, servis rem depan terasa kurang pakem."
                value={detailKerusakan}
                onChange={(e) => setDetailKerusakan(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="tanggal">Tanggal Rencana Service *</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggalRencana}
                onChange={(e) => setTanggalRencana(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tanda Tangan Pemohon</CardTitle>
            <CardDescription>
              Gambar tanda tangan kamu sebagai bukti pengajuan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignaturePadField onChange={setTtdPemohon} />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end sticky bottom-0 bg-gradient-to-t from-zinc-50 via-zinc-50 to-zinc-50/0 pt-6 pb-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Kirim Pengajuan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
