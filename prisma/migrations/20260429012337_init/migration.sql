-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nip" TEXT,
    "namaLengkap" TEXT NOT NULL,
    "unitKerja" TEXT,
    "role" TEXT NOT NULL DEFAULT 'pemohon',
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "kendaraan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platNomor" TEXT NOT NULL,
    "merkModel" TEXT NOT NULL,
    "jenisKendaraan" TEXT NOT NULL DEFAULT 'Motor',
    "namaPengguna" TEXT,
    "tahunPembelian" INTEGER,
    "statusKendaraan" TEXT NOT NULL DEFAULT 'aktif',
    "lastServiceDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pengajuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorSurat" TEXT,
    "userId" TEXT NOT NULL,
    "kendaraanId" TEXT NOT NULL,
    "detailKerusakan" TEXT NOT NULL,
    "tanggalRencana" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "ttdPemohon" TEXT,
    "ttdKasubag" TEXT,
    "alasanPenolakan" TEXT,
    "tanggalPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalPutusan" DATETIME,
    "kasubagId" TEXT,
    CONSTRAINT "pengajuan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pengajuan_kasubagId_fkey" FOREIGN KEY ("kasubagId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pengajuan_kendaraanId_fkey" FOREIGN KEY ("kendaraanId") REFERENCES "kendaraan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT,
    "userId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "pengajuan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "kendaraan_platNomor_key" ON "kendaraan"("platNomor");

-- CreateIndex
CREATE UNIQUE INDEX "pengajuan_nomorSurat_key" ON "pengajuan"("nomorSurat");
