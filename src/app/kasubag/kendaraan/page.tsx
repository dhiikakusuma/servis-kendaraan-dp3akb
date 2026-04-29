import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { KendaraanManager } from "@/components/kendaraan-manager";

export default async function KendaraanPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login/kasubag");
  const list = await prisma.kendaraan.findMany({ orderBy: { platNomor: "asc" } });
  return <KendaraanManager initial={list.map(serialize)} />;
}

function serialize(k: {
  id: string;
  platNomor: string;
  merkModel: string;
  jenisKendaraan: string;
  namaPengguna: string | null;
  tahunPembelian: number | null;
  statusKendaraan: string;
  lastServiceDate: Date | null;
}) {
  return {
    ...k,
    lastServiceDate: k.lastServiceDate ? k.lastServiceDate.toISOString() : null,
  };
}
