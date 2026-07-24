// "Karya Tulis Ilmiah (KTI)" → "kti"
// Dipakai buat nyocokin Event.nama_event (teks bebas) ke LombaKategori enum (HACKATHON, KTI, IOT).
export function eventSlug(namaEvent) {
  const label = namaEvent.match(/\(([^)]+)\)/)?.[1] || namaEvent;
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function kategoriSlug(kategori) {
  return kategori.toLowerCase().replace(/_/g, "-");
}

const SLUG_TO_KATEGORI = {
  hackathon: "HACKATHON",
  kti: "KTI",
  iot: "IOT",
};

// Event.nama_event (teks bebas) → LombaKategori enum, atau null kalau gak cocok.
export function kategoriFromEventName(namaEvent) {
  return SLUG_TO_KATEGORI[eventSlug(namaEvent || "")] || null;
}
