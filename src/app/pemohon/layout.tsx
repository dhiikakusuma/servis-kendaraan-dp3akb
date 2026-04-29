import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LayoutDashboard, PlusCircle, History } from "lucide-react";

const nav: NavItem[] = [
  { href: "/pemohon", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pemohon/pengajuan/baru", label: "Pengajuan Baru", icon: PlusCircle },
  { href: "/pemohon/riwayat", label: "Riwayat", icon: History },
];

export default async function PemohonLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login/pemohon");
  if (user.role !== "pemohon") redirect("/kasubag");

  return (
    <AppShell role="pemohon" user={user} nav={nav}>
      {children}
    </AppShell>
  );
}
