"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { formatTanggalPendek } from "@/lib/utils";

type K = {
  id: string;
  platNomor: string;
  merkModel: string;
  jenisKendaraan: string;
  namaPengguna: string | null;
  tahunPembelian: number | null;
  statusKendaraan: string;
  lastServiceDate: string | null;
};

export function KendaraanManager({ initial }: { initial: K[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    platNomor: "",
    merkModel: "",
    jenisKendaraan: "Motor",
    namaPengguna: "",
    tahunPembelian: "",
  });

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platNomor.trim() || !form.merkModel.trim()) {
      toast.error("Plat dan merk/model wajib");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/kendaraan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menambah kendaraan");
      setList((prev) => [...prev, { ...json, lastServiceDate: null }]);
      setForm({ platNomor: "", merkModel: "", jenisKendaraan: "Motor", namaPengguna: "", tahunPembelian: "" });
      setShowForm(false);
      toast.success("Kendaraan ditambahkan");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string, plat: string) => {
    if (!confirm(`Hapus kendaraan ${plat}?`)) return;
    try {
      const res = await fetch(`/api/kendaraan/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal menghapus");
      setList((prev) => prev.filter((k) => k.id !== id));
      toast.success("Kendaraan dihapus");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Master Data</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
            Data Kendaraan Dinas
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {list.length} kendaraan terdaftar
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Tambah Kendaraan
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kendaraan Baru</CardTitle>
            <CardDescription>Lengkapi data kendaraan yang ingin didaftarkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Plat Nomor *</Label>
                <Input
                  placeholder="KT 1234 CD"
                  value={form.platNomor}
                  onChange={(e) => setForm({ ...form, platNomor: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Jenis</Label>
                <select
                  value={form.jenisKendaraan}
                  onChange={(e) => setForm({ ...form, jenisKendaraan: e.target.value })}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option>Motor</option>
                  <option>Mobil</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Merk / Model *</Label>
                <Input
                  placeholder="Honda Vario 150"
                  value={form.merkModel}
                  onChange={(e) => setForm({ ...form, merkModel: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Pengguna</Label>
                <Input
                  placeholder="(opsional)"
                  value={form.namaPengguna}
                  onChange={(e) => setForm({ ...form, namaPengguna: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tahun Pembelian</Label>
                <Input
                  type="number"
                  min="1990"
                  max="2099"
                  placeholder="2022"
                  value={form.tahunPembelian}
                  onChange={(e) => setForm({ ...form, tahunPembelian: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={busy}>
                  Batal
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-widest">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Plat</th>
                <th className="text-left px-5 py-3 font-medium">Jenis</th>
                <th className="text-left px-5 py-3 font-medium">Merk/Model</th>
                <th className="text-left px-5 py-3 font-medium">Pengguna</th>
                <th className="text-left px-5 py-3 font-medium">Tahun</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Service Terakhir</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-zinc-500 text-sm">
                    Belum ada kendaraan terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((k) => (
                  <tr key={k.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3 font-medium tabular-nums">{k.platNomor}</td>
                    <td className="px-5 py-3 text-zinc-600">{k.jenisKendaraan}</td>
                    <td className="px-5 py-3">{k.merkModel}</td>
                    <td className="px-5 py-3 text-zinc-600">{k.namaPengguna ?? "-"}</td>
                    <td className="px-5 py-3 text-zinc-600">{k.tahunPembelian ?? "-"}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          k.statusKendaraan === "aktif"
                            ? "success"
                            : k.statusKendaraan === "service"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {k.statusKendaraan}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      {formatTanggalPendek(k.lastServiceDate)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onDelete(k.id, k.platNomor)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
