import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PengaturanForm } from "@/components/pengaturan-form";

export default async function PengaturanVerifikatorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login/verifikator");
  if (user.role !== "verifikator" && user.role !== "admin") {
    redirect(user.role === "kasubag" ? "/kasubag" : "/pemohon");
  }

  return (
    <PengaturanForm
      role="verifikator"
      initial={{
        namaLengkap: user.namaLengkap,
        nip: user.nip ?? "",
        unitKerja: user.unitKerja ?? "",
        jabatan: user.jabatan ?? "",
      }}
    />
  );
}
