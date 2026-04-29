import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Kasubag
    let kasubag = await prisma.user.findFirst({ where: { role: "kasubag" } });
    if (!kasubag) {
      kasubag = await prisma.user.create({
        data: {
          namaLengkap: "Sri Hartini, S.Sos.",
          nip: "198001012010011001",
          unitKerja: "Sub Bagian Umum dan Kepegawaian",
          jabatan: "KASUBAG UMUM",
          role: "kasubag",
          passwordHash: await bcrypt.hash("admin123", 10),
        },
      });
    }

    // Admin
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!admin) {
      await prisma.user.create({
        data: {
          namaLengkap: "Administrator",
          nip: "197001011990011001",
          unitKerja: "Bidang IT",
          role: "admin",
          passwordHash: await bcrypt.hash("admin123", 10),
        },
      });
    }

    // Pemohon sample
    const pemohonCount = await prisma.user.count({ where: { role: "pemohon" } });
    if (pemohonCount === 0) {
      await prisma.user.createMany({
        data: [
          {
            namaLengkap: "Budi Santoso",
            nip: "198505012010011002",
            unitKerja: "Bidang Pemberdayaan Perempuan",
            role: "pemohon",
          },
          {
            namaLengkap: "Siti Rahayu",
            nip: "199001012015012001",
            unitKerja: "Bidang Perlindungan Anak",
            role: "pemohon",
          },
          {
            namaLengkap: "Ahmad Hidayat",
            nip: "198702022012011003",
            unitKerja: "Bidang Keluarga Berencana",
            role: "pemohon",
          },
        ],
      });
    }

    // Kendaraan sample
    const kendCount = await prisma.kendaraan.count();
    if (kendCount === 0) {
      await prisma.kendaraan.createMany({
        data: [
          { platNomor: "KT 1234 CD", merkModel: "Honda Vario 150", tahunPembelian: 2020, statusKendaraan: "aktif" },
          { platNomor: "KT 5678 EF", merkModel: "Yamaha NMAX 155", tahunPembelian: 2021, statusKendaraan: "aktif" },
          { platNomor: "KT 9012 GH", merkModel: "Honda PCX 160", tahunPembelian: 2022, statusKendaraan: "aktif" },
          { platNomor: "KT 3456 IJ", merkModel: "Yamaha Aerox 155", tahunPembelian: 2019, statusKendaraan: "aktif" },
          { platNomor: "KT 7890 KL", merkModel: "Suzuki Address", tahunPembelian: 2018, statusKendaraan: "service" },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Seed data berhasil dibuat.",
      credentials: {
        kasubag: { password: "admin123" },
        admin: { password: "admin123" },
        pemohon_contoh: ["Budi Santoso", "Siti Rahayu", "Ahmad Hidayat"],
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat seed data" },
      { status: 500 },
    );
  }
}
