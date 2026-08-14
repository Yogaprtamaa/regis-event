// Pendaftaran tutup otomatis setelah hari terakhir event lewat.
// Tanggal disimpan sebagai UTC midnight ("2026-08-14" → 14 Agu 00:00Z),
// jadi batasnya = 24 jam kemudian dikurangi offset WIB → 15 Agu 00:00 WIB.
const HARI_MS = 24 * 60 * 60 * 1000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export function pendaftaranDitutup(tanggalAkhir, sekarang = Date.now()) {
  if (!tanggalAkhir) return false;
  const batas = new Date(tanggalAkhir).getTime() + HARI_MS - WIB_OFFSET_MS;
  return Number.isFinite(batas) && sekarang > batas;
}
