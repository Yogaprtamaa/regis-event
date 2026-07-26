-- Nama tim peserta kelompok. Sebelumnya Submission.namaTim diisi nama ketua.
ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "namaTim" TEXT;
