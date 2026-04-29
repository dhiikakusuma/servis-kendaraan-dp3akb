"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Props = {
  role: "pemohon" | "kasubag" | "admin";
  user: { namaLengkap: string; unitKerja: string | null };
  nav: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ role, user, nav, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile nav bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-semibold text-sm">DP3AKB</span>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-lg p-2 hover:bg-zinc-100"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="md:grid md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 border-r border-zinc-200 bg-white transition-transform md:static md:translate-x-0 md:w-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex flex-col h-full">
            <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-zinc-100">
              <Logo size="sm" />
              <div>
                <p className="text-sm font-semibold leading-tight">DP3AKB</p>
                <p className="text-xs text-zinc-500 leading-tight">Kota Balikpapan</p>
              </div>
            </div>

            <div className="px-4 pt-4 pb-2">
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                    {user.namaLengkap
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.namaLengkap}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {user.unitKerja ?? "—"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={role === "kasubag" ? "warning" : "success"}
                  className="mt-2 capitalize"
                >
                  {role === "admin" ? "Administrator" : role}
                </Badge>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-zinc-100">
              <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="h-4 w-4" /> Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            className="md:hidden fixed inset-0 z-10 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="min-h-[calc(100vh-3.5rem)] md:min-h-screen">
          <div className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
