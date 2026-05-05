import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function VerifikatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login/verifikator");
  if (user.role !== "verifikator" && user.role !== "admin") {
    redirect(user.role === "kasubag" ? "/kasubag" : "/pemohon");
  }

  return (
    <AppShell
      role="verifikator"
      user={{ namaLengkap: user.namaLengkap, unitKerja: user.unitKerja }}
    >
      {children}
    </AppShell>
  );
}
