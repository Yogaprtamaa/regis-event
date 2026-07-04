-- CreateEnum
CREATE TYPE "LombaKategori" AS ENUM ('HACKATHON', 'KTI', 'IOT', 'GAME_MAKING');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'LOLOS_SELEKSI', 'TIDAK_LOLOS');

-- CreateTable
CREATE TABLE "Juri" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kategori" "LombaKategori" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Juri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "kategori" "LombaKategori" NOT NULL,
    "namaTim" TEXT NOT NULL,
    "ketuaNama" TEXT NOT NULL,
    "ketuaNim" TEXT,
    "ketuaEmail" TEXT NOT NULL,
    "anggota" JSONB,
    "judulKarya" TEXT NOT NULL,
    "deskripsi" TEXT,
    "fileKaryaUrl" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criteria" (
    "id" TEXT NOT NULL,
    "kategori" "LombaKategori" NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "juriId" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreItem" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ScoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalistPublish" (
    "id" TEXT NOT NULL,
    "kategori" "LombaKategori" NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "FinalistPublish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Juri_supabaseId_key" ON "Juri"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Juri_email_key" ON "Juri"("email");

-- CreateIndex
CREATE INDEX "Submission_kategori_status_idx" ON "Submission"("kategori", "status");

-- CreateIndex
CREATE INDEX "Criteria_kategori_idx" ON "Criteria"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "Score_submissionId_juriId_key" ON "Score"("submissionId", "juriId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreItem_scoreId_criteriaId_key" ON "ScoreItem"("scoreId", "criteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalistPublish_kategori_key" ON "FinalistPublish"("kategori");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_juriId_fkey" FOREIGN KEY ("juriId") REFERENCES "Juri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreItem" ADD CONSTRAINT "ScoreItem_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreItem" ADD CONSTRAINT "ScoreItem_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "Criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

