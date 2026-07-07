// "Karya Tulis Ilmiah (KTI)" → "kti", "Game Making" → "game-making"
// Dipakai buat nyocokin Event.nama_event (teks bebas) ke LombaKategori enum (HACKATHON, KTI, IOT, GAME_MAKING).
export function eventSlug(namaEvent) {
  const label = namaEvent.match(/\(([^)]+)\)/)?.[1] || namaEvent;
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function kategoriSlug(kategori) {
  return kategori.toLowerCase().replace(/_/g, "-");
}
