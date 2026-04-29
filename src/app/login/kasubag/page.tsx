"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

export default function LoginKasubag() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kasubag", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal login");
      toast.success(`Selamat datang, ${json.user.namaLengkap}`);
      router.replace("/kasubag");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      <header className="mx-auto max-w-6xl w-full px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-10">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center pb-2">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle>Masuk sebagai Kasubag</CardTitle>
            <CardDescription>
              Password default: <code className="rounded bg-zinc-100 px-1.5 py-0.5">admin123</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoFocus
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" variant="accent" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
            <div className="mt-6 flex items-center gap-3 text-xs text-zinc-500">
              <span className="h-px flex-1 bg-zinc-200" />
              atau
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <Link
              href="/login/pemohon"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              Masuk sebagai Pemohon
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
