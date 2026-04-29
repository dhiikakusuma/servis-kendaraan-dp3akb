import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  FileText,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Workflow,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getSessionUser();
  if (session?.role === "pemohon") redirect("/pemohon");
  if (session?.role === "kasubag" || session?.role === "admin") redirect("/kasubag");

  return (
    <div className="bg-mesh min-h-screen">
      <header className="mx-auto max-w-6xl px-5 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-sm font-semibold leading-tight">DP3AKB</p>
            <p className="text-xs text-zinc-500 leading-tight">Kota Balikpapan</p>
          </div>
        </div>
        <Link
          href="https://github.com/dhiikakusuma"
          className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block"
        >
          v1.0 · 2026
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-6 pb-20">
        {/* Hero */}
        <section className="pt-10 md:pt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Digitalisasi Layanan Kendaraan Dinas
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            Pengajuan service kendaraan dinas, <span className="text-brand-600">tanpa datang ke kantor.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-zinc-600 max-w-2xl mx-auto">
            Ajukan, disetujui, tanda tangan digital, lalu unduh surat pengantar PDF resmi —
            semua dari satu dashboard. Bawa PDF langsung ke bengkel rekanan.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/login/pemohon">
                <UserCircle2 className="h-4 w-4" /> Masuk sebagai Pemohon
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login/kasubag">
                <ShieldCheck className="h-4 w-4" /> Masuk sebagai Kasubag
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Belum ada data? Jalankan seed di <code className="rounded bg-zinc-100 px-1.5 py-0.5">/api/seed</code> untuk akun demo.
          </p>
        </section>

        {/* Workflow */}
        <section className="mt-20 md:mt-24">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-600 font-semibold mb-2">
              Alur Kerja
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              8 langkah, selesai.
            </h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-sm font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900">{step.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="mt-20 md:mt-24 grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-20 md:mt-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-10 md:p-16 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight max-w-xl">
              Siap mulai mengajukan service?
            </h2>
            <p className="mt-3 text-brand-50/90 max-w-lg">
              Masuk dengan nama lengkap kamu dan buat pengajuan pertama dalam waktu kurang dari satu menit.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/login/pemohon">
                  Masuk sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 py-8">
        <div className="mx-auto max-w-6xl px-6 text-xs text-zinc-500 flex items-center justify-between flex-wrap gap-3">
          <p>© {new Date().getFullYear()} DP3AKB Kota Balikpapan</p>
          <p>Dibuat untuk Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana</p>
        </div>
      </footer>
    </div>
  );
}

const STEPS = [
  { title: "Login Pemohon", desc: "Masuk dengan nama lengkap — tanpa password ribet.", icon: UserCircle2 },
  { title: "Buat Pengajuan", desc: "Input plat nomor, kerusakan, dan tanggal rencana.", icon: Workflow },
  { title: "Tanda Tangan Pemohon", desc: "Konfirmasi pengajuan dengan nama terang sebagai TTD elektronik.", icon: FileSignature },
  { title: "Review Kasubag", desc: "Kasubag melihat, meninjau, dan memutuskan.", icon: ShieldCheck },
  { title: "Persetujuan + TTD", desc: "Setujui/tolak dengan tanda tangan digital resmi.", icon: CheckCircle2 },
  { title: "Generate PDF", desc: "Surat pengantar PDF otomatis dengan kop + TTD.", icon: FileText },
  { title: "Unduh Surat", desc: "Pemohon unduh PDF dari dashboard masing-masing.", icon: ArrowRight },
  { title: "Bawa ke Rekanan", desc: "Surat siap dibawa ke bengkel rekanan yang ditunjuk.", icon: Sparkles },
];

const FEATURES = [
  {
    title: "Tanda Tangan Elektronik",
    desc: "Cukup isi nama lengkap sebagai tanda tangan, dicetak otomatis di surat PDF resmi.",
    icon: FileSignature,
  },
  {
    title: "Surat PDF Resmi",
    desc: "Kop surat DP3AKB, nomor surat otomatis, tabel kendaraan, dan TTD kasubag.",
    icon: FileText,
  },
  {
    title: "Audit Trail",
    desc: "Setiap aksi tersimpan — siapa, kapan, dan tindakan apa yang dilakukan.",
    icon: ShieldCheck,
  },
];
