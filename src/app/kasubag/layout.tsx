import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Car, FileSpreadsheet, History, Inbox, LayoutDashboard } from "lucide-react";

const nav: NavItem[] = [
  { href: "/kasubag", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kasubag/pengajuan", label: "Inbox Pengajuan", icon: Inbox },
  { href: "/kasubag/riwayat", label: "Riwayat", icon: History },
  { href: "/kasubag/kendaraan", label: "Data Kendaraan", icon: Car },
  { href: "/kasubag/export", label: "Export Data", icon: FileSpreadsheet },
];

export default async function KasubagLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");
  if (user.role !== "kasubag" && user.role !== "admin") redirect("/pemohon");

  return (
    <AppShell role={user.role as "kasubag" | "admin"} user={user} nav={nav}>
      {children}
    </AppShell>
  );
}
