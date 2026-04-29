import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function KasubagLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");
  if (user.role !== "kasubag" && user.role !== "admin") redirect("/pemohon");

  return (
    <AppShell
      role={user.role as "kasubag" | "admin"}
      user={{ namaLengkap: user.namaLengkap, unitKerja: user.unitKerja }}
    >
      {children}
    </AppShell>
  );
}
