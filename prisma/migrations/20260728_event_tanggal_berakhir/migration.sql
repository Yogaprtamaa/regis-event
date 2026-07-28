-- Tanggal berakhir event. Null = acara sehari, pakai `tanggal` saja.
ALTER TABLE "Event" ADD COLUMN "tanggal_berakhir" TIMESTAMP(3);
