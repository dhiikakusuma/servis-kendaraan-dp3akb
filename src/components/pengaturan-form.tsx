"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck, UserCog } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/toast";

type Props = {
  initial: {
    namaLengkap: string;
    nip: string;
    unitKerja: string;
    jabatan: string;
  };
};

export function PengaturanForm({ initial }: Props) {
  const router = useRouter();
  const [namaLengkap, setNama] = useState(initial.namaLengkap);
  const [nip, setNip] = useState(initial.nip);
  const [unitKerja, setUnit] = useState(initial.unitKerja);
  const [jabatan, setJabatan] = useState(initial.jabatan || "KASUBAG UMUM");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }
    if (!jabatan.trim()) {
      toast.error("Jabatan penandatangan wajib diisi");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          namaLengkap: namaLengkap.trim(),
          nip: nip.trim(),
          unitKerja: unitKerja.trim(),
          jabatan: jabatan.trim(),
          ...(password ? { password } : {}),
        }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
      toast.success("Data penandatangan berhasil diperbarui");
      setPassword("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">PENGATURAN</p>
        <h1 className="text-2xl sm:text-3xl font-semibold">Data Penandatangan</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Nama dan jabatan di bawah ini akan tampil sebagai penandatangan pada surat pengantar service kendaraan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-brand-700" />
            Identitas Penandatangan
          </CardTitle>
          <CardDescription>
            Informasi ini akan dicetak pada blok tanda tangan kanan surat pengantar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                <Input
                  id="namaLengkap"
                  value={namaLengkap}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Dessy Ruswandari, S.E."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jabatan">Jabatan Penandatangan *</Label>
                <Input
                  id="jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="KASUBAG UMUM"
                  required
                />
                <p className="text-xs text-zinc-500">
                  Akan ditulis KAPITAL di atas nama pada surat.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="198001012010011001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitKerja">Unit Kerja</Label>
                <Input
                  id="unitKerja"
                  value={unitKerja}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Sub Bagian Umum dan Kepegawaian"
                />
              </div>
            </div>

            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-900">
                <ShieldCheck className="h-4 w-4" />
                Preview pada surat
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <span className="font-bold uppercase">{jabatan || "KASUBAG UMUM"}</span>
                <span className="italic text-brand-800 text-lg" style={{ fontFamily: "'Brush Script MT','Lucida Handwriting',cursive" }}>
                  {namaLengkap || "Nama Kasubag"}
                </span>
                <span className="font-semibold border-b border-zinc-400 inline-block w-fit">
                  {namaLengkap || "Nama Kasubag"}
                </span>
                {nip && <span className="text-xs text-zinc-500">NIP. {nip}</span>}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" /> Ganti password (opsional)
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah"
                autoComplete="new-password"
              />
              <p className="text-xs text-zinc-500">
                Minimal 4 karakter. Hanya diperbarui jika diisi.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                {busy ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
