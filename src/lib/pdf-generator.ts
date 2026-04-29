"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PengajuanForPdf = {
  id: string;
  nomorSurat: string | null;
  detailKerusakan: string;
  tanggalRencana: string;
  tanggalPengajuan: string;
  tanggalPutusan: string | null;
  ttdPemohon: string | null;
  ttdKasubag: string | null;
  user: {
    namaLengkap: string;
    nip: string | null;
    unitKerja: string | null;
  };
  kasubag: {
    namaLengkap: string;
    nip: string | null;
  } | null;
  kendaraan: {
    platNomor: string;
    merkModel: string;
    jenisKendaraan: string;
    tahunPembelian: number | null;
  };
};

function fmt(date: string | Date | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateSuratPengantar(p: PengajuanForPdf) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;

  // KOP SURAT
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PEMERINTAH KOTA BALIKPAPAN", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(13);
  doc.text(
    "DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK,",
    pageWidth / 2,
    24,
    { align: "center" },
  );
  doc.text("DAN KELUARGA BERENCANA", pageWidth / 2, 30, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Jl. Jenderal Sudirman No. 1, Balikpapan, Kalimantan Timur · Telp (0542) 123456",
    pageWidth / 2,
    36,
    { align: "center" },
  );
  doc.setLineWidth(0.8);
  doc.line(marginX, 40, pageWidth - marginX, 40);
  doc.setLineWidth(0.3);
  doc.line(marginX, 41.2, pageWidth - marginX, 41.2);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SURAT PENGANTAR SERVICE KENDARAAN DINAS", pageWidth / 2, 52, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nomor: ${p.nomorSurat ?? "(draft)"}`, pageWidth / 2, 58, {
    align: "center",
  });

  // Intro
  let y = 70;
  doc.setFontSize(11);
  const intro = `Yang bertanda tangan di bawah ini, Kasubag Umum dan Kepegawaian Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana Kota Balikpapan, dengan ini menerangkan bahwa kendaraan dinas di bawah ini memerlukan pemeliharaan / perbaikan pada bengkel rekanan:`;
  const introLines = doc.splitTextToSize(intro, pageWidth - marginX * 2);
  doc.text(introLines, marginX, y);
  y += introLines.length * 5 + 4;

  // Table
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: [6, 95, 70], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } },
    body: [
      ["Pemohon", p.user.namaLengkap + (p.user.nip ? ` (NIP. ${p.user.nip})` : "")],
      ["Unit Kerja", p.user.unitKerja ?? "-"],
      ["Plat Nomor", p.kendaraan.platNomor],
      ["Jenis Kendaraan", p.kendaraan.jenisKendaraan],
      ["Merk / Model", p.kendaraan.merkModel],
      ["Tahun", p.kendaraan.tahunPembelian ? String(p.kendaraan.tahunPembelian) : "-"],
      ["Rencana Service", fmt(p.tanggalRencana)],
      ["Detail Kerusakan", p.detailKerusakan],
    ],
  });

  // Update y after table
  // @ts-expect-error jspdf-autotable augments doc
  y = doc.lastAutoTable.finalY + 8;

  // Closing
  const closing = `Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya. Biaya pemeliharaan dibebankan pada anggaran DPA tahun berjalan, sesuai ketentuan yang berlaku.`;
  const closingLines = doc.splitTextToSize(closing, pageWidth - marginX * 2);
  doc.text(closingLines, marginX, y);
  y += closingLines.length * 5 + 10;

  // Signature block
  const rightX = pageWidth - marginX - 65;
  const leftX = marginX;
  doc.setFontSize(10);
  doc.text("Mengetahui,", rightX, y);
  doc.text("Kasubag Umum dan Kepegawaian", rightX, y + 5);

  doc.text("Pemohon,", leftX, y);

  // Signature images
  const sigBoxY = y + 8;
  const sigW = 45;
  const sigH = 22;
  try {
    if (p.ttdPemohon) {
      doc.addImage(p.ttdPemohon, "PNG", leftX, sigBoxY, sigW, sigH);
    }
  } catch {
    /* ignore bad image */
  }
  try {
    if (p.ttdKasubag) {
      doc.addImage(p.ttdKasubag, "PNG", rightX, sigBoxY, sigW, sigH);
    }
  } catch {
    /* ignore */
  }

  doc.setLineWidth(0.2);
  doc.line(leftX, sigBoxY + sigH + 1, leftX + sigW, sigBoxY + sigH + 1);
  doc.line(rightX, sigBoxY + sigH + 1, rightX + sigW, sigBoxY + sigH + 1);

  doc.setFont("helvetica", "bold");
  doc.text(p.user.namaLengkap, leftX, sigBoxY + sigH + 6);
  doc.text(p.kasubag?.namaLengkap ?? "(Belum disetujui)", rightX, sigBoxY + sigH + 6);
  doc.setFont("helvetica", "normal");
  if (p.user.nip) doc.text(`NIP. ${p.user.nip}`, leftX, sigBoxY + sigH + 11);
  if (p.kasubag?.nip) doc.text(`NIP. ${p.kasubag.nip}`, rightX, sigBoxY + sigH + 11);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Diterbitkan pada ${fmt(p.tanggalPutusan ?? p.tanggalPengajuan)} · ID ${p.id}`,
    marginX,
    285,
  );

  return doc;
}

export function downloadSuratPengantar(p: PengajuanForPdf) {
  const doc = generateSuratPengantar(p);
  const filename = `Surat-Pengantar-${p.kendaraan.platNomor.replace(/\s+/g, "-")}-${p.id.slice(0, 6)}.pdf`;
  doc.save(filename);
}
