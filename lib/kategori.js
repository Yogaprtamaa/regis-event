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

// Berkas yang dikumpulkan tiap kategori. Video demo ~500MB jadi cuma link,
// gak diupload. File PDF diupload langsung ke Supabase (bypass limit body Vercel).
export const KARYA_REQUIREMENTS = {
  HACKATHON: {
    fileLabel: "Executive Summary (PDF)",
    fileHelp: "Ringkasan eksekutif dalam format PDF, maksimal 25MB.",
    linkRepo: "required",
    linkVideo: "required",
    fileTurnitin: "off",
  },
  IOT: {
    fileLabel: "Laporan (PDF)",
    fileHelp: "Laporan lengkap dalam format PDF, maksimal 25MB.",
    linkRepo: "off",
    linkVideo: "required",
    fileTurnitin: "off",
  },
  KTI: {
    fileLabel: "Naskah KTI (PDF)",
    fileHelp: "Naskah karya tulis dalam format PDF, maksimal 25MB.",
    linkRepo: "off",
    linkVideo: "optional",
    // Bukti cek plagiarisme (maks. 30% similarity) — syarat lomba KTI
    fileTurnitin: "required",
  },
};

export const MAX_KARYA_BYTES = 25 * 1024 * 1024;

export function karyaRequirements(kategori) {
  return KARYA_REQUIREMENTS[kategori] || KARYA_REQUIREMENTS.KTI;
}
