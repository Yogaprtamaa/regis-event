// Relatif, bukan alias @ — supaya lib/storage.test.mjs bisa jalan pakai node biasa.
import { createAdminClient } from "./supabase/admin.js";

// Kedua bucket privat. Yang tersimpan di DB tetap berbentuk URL "public" karena
// itu yang dikembalikan getPublicUrl saat upload — bentuk itu kita pakai murni
// sebagai cara menyimpan bucket + path, bukan sebagai link yang bisa dibuka.
// Sebelum dikirim ke klien, tiap berkas ditandatangani dan kedaluwarsa.
const PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

export const SATU_JAM = 3600;
export const SEMINGGU = 7 * 24 * 3600;

export function parseStoragePath(url) {
  if (typeof url !== "string" || !url.startsWith(PREFIX)) return null;
  const sisa = url.slice(PREFIX.length);
  const pisah = sisa.indexOf("/");
  if (pisah < 1) return null;
  const path = sisa.slice(pisah + 1);
  if (!path) return null;
  return { bucket: sisa.slice(0, pisah), path: decodeURIComponent(path) };
}

// Kumpulkan semua URL berkas milik kita dari struktur JSON apa pun.
function kumpulkan(nilai, keluar) {
  if (typeof nilai === "string") {
    if (parseStoragePath(nilai)) keluar.add(nilai);
  } else if (Array.isArray(nilai)) {
    for (const v of nilai) kumpulkan(v, keluar);
  } else if (nilai && typeof nilai === "object") {
    for (const v of Object.values(nilai)) kumpulkan(v, keluar);
  }
}

function petakan(nilai, tanda) {
  if (typeof nilai === "string") return tanda(nilai);
  if (Array.isArray(nilai)) return nilai.map((v) => petakan(v, tanda));
  if (nilai instanceof Date) return nilai;
  if (nilai && typeof nilai === "object") {
    return Object.fromEntries(
      Object.entries(nilai).map(([k, v]) => [k, petakan(v, tanda)]),
    );
  }
  return nilai;
}

// Satu panggilan Supabase per bucket, bukan per berkas — daftar peserta bisa
// berisi ratusan lampiran.
async function buatPenandatangan(urls, expiresIn) {
  const perBucket = new Map();
  for (const url of urls) {
    const { bucket, path } = parseStoragePath(url);
    if (!perBucket.has(bucket)) perBucket.set(bucket, new Map());
    perBucket.get(bucket).set(path, url);
  }

  const admin = createAdminClient();
  const hasil = new Map();

  await Promise.all(
    [...perBucket].map(async ([bucket, pathKeUrl]) => {
      const paths = [...pathKeUrl.keys()];
      const { data, error } = await admin.storage
        .from(bucket)
        .createSignedUrls(paths, expiresIn);
      if (error) {
        console.error(`Gagal menandatangani berkas bucket ${bucket}:`, error.message);
        return;
      }
      for (const item of data || []) {
        if (item.signedUrl) hasil.set(pathKeUrl.get(item.path), item.signedUrl);
      }
    }),
  );

  // Berkas yang gagal ditandatangani jadi null, bukan URL mentah yang pasti
  // ditolak bucket privat — biar UI-nya jelas kosong, bukan gambar rusak.
  return (url) => (parseStoragePath(url) ? hasil.get(url) ?? null : url);
}

// Ganti seluruh URL berkas di dalam data jadi URL bertanda tangan.
// Link luar (Google Drive, YouTube, dsb) dibiarkan apa adanya.
export async function tandatanganiBerkas(data, expiresIn = SATU_JAM) {
  const urls = new Set();
  kumpulkan(data, urls);
  if (urls.size === 0) return data;
  const tanda = await buatPenandatangan([...urls], expiresIn);
  return petakan(data, tanda);
}
