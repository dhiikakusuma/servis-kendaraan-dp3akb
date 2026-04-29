import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PengaturanForm } from "@/components/pengaturan-form";

export default async function PengaturanPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");
  if (user.role !== "kasubag" && user.role !== "admin") redirect("/pemohon");

  return (
    <PengaturanForm
      initial={{
        namaLengkap: user.namaLengkap,
        nip: user.nip ?? "",
        unitKerja: user.unitKerja ?? "",
        jabatan: user.jabatan ?? "",
      }}
    />
  );
}
