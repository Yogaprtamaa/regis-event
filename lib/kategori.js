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
// gak diupload.
//
// fileKarya: "drive"  → peserta nempel link Google Drive, gak ada file masuk server
//            "upload" → PDF diupload langsung ke Supabase (bypass limit body Vercel)
// Cuma KTI yang upload PDF; sisanya lewat Drive karena berkasnya berat & macam-macam.
export const KARYA_REQUIREMENTS = {
  HACKATHON: {
    fileKarya: "drive",
    fileLabel: "Link Google Drive Karya",
    fileHelp:
      "Kumpulkan seluruh berkas karya (executive summary, aset, dokumentasi) dalam satu folder Google Drive, lalu tempel linknya di sini.",
    linkRepo: "required",
    linkVideo: "required",
    fileTurnitin: "off",
  },
  IOT: {
    fileKarya: "drive",
    fileLabel: "Link Google Drive Karya",
    fileHelp:
      "Kumpulkan laporan dan seluruh berkas pendukung dalam satu folder Google Drive, lalu tempel linknya di sini.",
    linkRepo: "off",
    linkVideo: "required",
    fileTurnitin: "off",
  },
  KTI: {
    fileKarya: "upload",
    fileLabel: "Naskah KTI (PDF)",
    fileHelp: "Naskah karya tulis dalam format PDF, maksimal 10MB.",
    linkRepo: "off",
    linkVideo: "optional",
    // Bukti cek plagiarisme (maks. 30% similarity) — syarat lomba KTI
    fileTurnitin: "required",
  },
};

export const MAX_KARYA_BYTES = 10 * 1024 * 1024;

export function karyaRequirements(kategori) {
  return KARYA_REQUIREMENTS[kategori] || KARYA_REQUIREMENTS.KTI;
}
