-- Pengaturan data peserta per event (individu/kelompok, batas anggota, kolom NIM)
ALTER TABLE "Event" ADD COLUMN "pesertaConfig" JSONB;
