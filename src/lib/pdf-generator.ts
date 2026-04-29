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
  rekananNama: string | null;
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
    jabatan: string | null;
  } | null;
  kendaraan: {
    platNomor: string;
    merkModel: string;
    jenisKendaraan: string;
    tahunPembelian: number | null;
  };
};

function fmtTanggal(date: string | Date | null | undefined) {
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
  const contentWidth = pageWidth - marginX * 2;

  // ====================================================================
  // KOP SURAT
  // ====================================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PEMERINTAH KOTA BALIKPAPAN", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(13);
  doc.text(
    "DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK",
    pageWidth / 2,
    24,
    { align: "center" },
  );
  doc.text("DAN KELUARGA BERENCANA", pageWidth / 2, 30, { align: "center" });
  doc.setFontSize(12);
  doc.text("(DP3AKB)", pageWidth / 2, 36, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Jl. MT. Haryono Rt.26 Nomor 186 Kelurahan Sungai Nangka,",
    pageWidth / 2,
    42,
    { align: "center" },
  );
  doc.text(
    "Kecamatan Balikpapan Selatan, Kota Balikpapan",
    pageWidth / 2,
    47,
    { align: "center" },
  );
  doc.text(
    "Telp. : (0542) 424808, 8810561  Fax : (0542) 424808, 8810562",
    pageWidth / 2,
    52,
    { align: "center" },
  );
  doc.text(
    "Email : dpppakbkotabalikpapan@yahoo.com   Kode Pos : 76114",
    pageWidth / 2,
    57,
    { align: "center" },
  );

  // Double horizontal rule
  doc.setLineWidth(0.8);
  doc.line(marginX, 61, pageWidth - marginX, 61);
  doc.setLineWidth(0.3);
  doc.line(marginX, 62.5, pageWidth - marginX, 62.5);

  // ====================================================================
  // DATE & RECIPIENT
  // ====================================================================
  let y = 72;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const tanggalSurat = fmtTanggal(p.tanggalPutusan ?? p.tanggalPengajuan);
  doc.text(`Balikpapan, ${tanggalSurat}`, pageWidth - marginX, y, {
    align: "right",
  });
  y += 10;

  doc.text("Kepada", marginX, y);
  y += 5;
  doc.text("Yth.", marginX, y);
  doc.text(`Pimpinan ${p.rekananNama ?? "Bengkel Rekanan"}`, marginX + 10, y);
  y += 5;
  doc.text("di-", marginX + 10, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Balikpapan", marginX + 20, y);
  doc.setFont("helvetica", "normal");

  // ====================================================================
  // TITLE
  // ====================================================================
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SURAT PENGANTAR", pageWidth / 2, y, { align: "center" });
  // Underline the title
  const titleWidth = doc.getTextWidth("SURAT PENGANTAR");
  doc.setLineWidth(0.4);
  doc.line(
    pageWidth / 2 - titleWidth / 2,
    y + 1,
    pageWidth / 2 + titleWidth / 2,
    y + 1,
  );
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nomor : ${p.nomorSurat ?? "(draft)"}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 10;

  // ====================================================================
  // DATA TABLE
  // ====================================================================
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
      textColor: 20,
    },
    headStyles: {
      fillColor: [240, 249, 255],
      textColor: 20,
      fontStyle: "bold",
      halign: "center",
    },
    head: [
      ["OPD", "Jenis Kendaraan", "Merk / Type", "Nomor Polisi", "Keterangan"],
    ],
    body: [
      [
        "DP3AKB",
        p.kendaraan.jenisKendaraan === "Motor" ? "Roda 2" : "Roda 4",
        p.kendaraan.merkModel,
        p.kendaraan.platNomor,
        p.detailKerusakan,
      ],
    ],
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 28 },
      4: { cellWidth: contentWidth - 20 - 28 - 32 - 28 },
    },
  });
  // @ts-expect-error jspdf-autotable augments doc
  y = doc.lastAutoTable.finalY + 14;

  // ====================================================================
  // SIGNATURE BLOCKS
  // ====================================================================
  const sigLeftX = marginX + 5;
  const sigRightX = pageWidth - marginX - 65;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PENGGUNA KENDARAAN", sigLeftX, y);
  doc.text(p.kasubag?.jabatan ?? "KASUBAG UMUM", sigRightX, y);

  // Signature slot (empty space for handwritten / e-signature text)
  const sigSlotY = y + 4;
  const sigSlotH = 20;

  // Pemohon name signature (cursive)
  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.setTextColor(30);
  if (p.ttdPemohon && !p.ttdPemohon.startsWith("data:image")) {
    doc.text(p.ttdPemohon, sigLeftX, sigSlotY + sigSlotH - 4);
  } else if (p.ttdPemohon?.startsWith("data:image")) {
    try {
      doc.addImage(p.ttdPemohon, "PNG", sigLeftX, sigSlotY, 55, sigSlotH);
    } catch {
      /* ignore */
    }
  }

  if (p.ttdKasubag && !p.ttdKasubag.startsWith("data:image")) {
    doc.text(p.ttdKasubag, sigRightX, sigSlotY + sigSlotH - 4);
  } else if (p.ttdKasubag?.startsWith("data:image")) {
    try {
      doc.addImage(p.ttdKasubag, "PNG", sigRightX, sigSlotY, 55, sigSlotH);
    } catch {
      /* ignore */
    }
  }

  // Names under the signatures (bold, underlined to mimic letter)
  const nameY = sigSlotY + sigSlotH + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(p.user.namaLengkap, sigLeftX, nameY);
  doc.text(
    p.kasubag?.namaLengkap ?? "(Belum disetujui)",
    sigRightX,
    nameY,
  );
  // Underline names
  doc.setLineWidth(0.3);
  doc.line(
    sigLeftX,
    nameY + 0.8,
    sigLeftX + doc.getTextWidth(p.user.namaLengkap),
    nameY + 0.8,
  );
  const kName = p.kasubag?.namaLengkap ?? "(Belum disetujui)";
  doc.line(
    sigRightX,
    nameY + 0.8,
    sigRightX + doc.getTextWidth(kName),
    nameY + 0.8,
  );

  // NIP lines (optional)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  let subY = nameY + 5;
  if (p.user.nip) {
    doc.text(`NIP. ${p.user.nip}`, sigLeftX, subY);
  }
  if (p.kasubag?.nip) {
    doc.text(`NIP. ${p.kasubag.nip}`, sigRightX, subY);
  }
  subY += 10;

  // ====================================================================
  // NOTE
  // ====================================================================
  y = Math.max(subY, nameY + 18);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Note :", marginX, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const notes = [
    "Diharapkan untuk melakukan pemeliharaan dengan maximal budget Rp 1.000.000 / Tahun (Harga Belum Termasuk pajak 11%).",
    "Tidak diperkenankan melakukan Penggantian Aksesoris Kendaraan karena bukan tanggungan dari DP3AKB selain Sparepart dan Jasa. Jika diketahui user mengganti Aksesoris maka akan di tanggung sendiri oleh pengguna Kendaraan.",
    "Tidak diperkenankan untuk melakukan pemeliharaan melebihi budget yg tertera pada No. 1, jika melebihi budget maka akan di tanggung oleh pengguna Kendaraan.",
    "Diharapkan Pengguna Kendaraan mengambil foto pada saat dilakukannya pemeliharaan kendaraan.",
  ];
  notes.forEach((n, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${n}`, contentWidth - 5);
    doc.text(lines, marginX + 5, y);
    y += lines.length * 4.5 + 1.5;
  });

  // ====================================================================
  // FOOTER
  // ====================================================================
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    `Rencana service: ${fmtTanggal(p.tanggalRencana)} · ID ${p.id}`,
    marginX,
    287,
  );

  return doc;
}

export function downloadSuratPengantar(p: PengajuanForPdf) {
  const doc = generateSuratPengantar(p);
  const filename = `Surat-Pengantar-${p.kendaraan.platNomor.replace(/\s+/g, "-")}-${p.id.slice(0, 6)}.pdf`;
  doc.save(filename);
}
