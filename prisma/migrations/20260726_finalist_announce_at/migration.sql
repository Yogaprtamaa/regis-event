-- Tanggal pengumuman finalis per kategori. Hasil baru tampil ke publik
-- kalau published = true DAN NOW() >= announceAt.
ALTER TABLE "FinalistPublish" ADD COLUMN IF NOT EXISTS "announceAt" TIMESTAMP(3);
