import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function PemohonLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login/pemohon");
  if (user.role !== "pemohon") redirect("/kasubag");

  return (
    <AppShell role="pemohon" user={{ namaLengkap: user.namaLengkap, unitKerja: user.unitKerja }}>
      {children}
    </AppShell>
  );
}
