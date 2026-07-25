// Skema formulir pendaftaran lomba — dipakai bareng client (render + validasi)
// dan server (parsing + simpan). Admin bisa ngedit lewat form-builder di edit event.
//
// Field bawaan yang id-nya ada di RESERVED_* disimpan ke kolom Participant khusus
// (biar export & fitur lama tetap jalan). Field lain masuk ke Participant.formData (JSON).

export const FIELD_TYPES = [
  { value: "text", label: "Teks singkat" },
  { value: "textarea", label: "Teks panjang" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Nomor telepon" },
  { value: "number", label: "Angka" },
  { value: "select", label: "Pilihan (dropdown)" },
  { value: "file", label: "Upload file (1)" },
  { value: "files", label: "Upload file (banyak)" },
  { value: "checkbox", label: "Centang (ya/tidak)" },
];

// id field → kolom khusus di tabel Participant (String). Selain ini → formData JSON.
export const RESERVED_TEXT_COLUMNS = [
  "email",
  "no_wa",
  "jurusan",
  "universitas",
  "fakultas",
  "kotaDomisili",
  "provinsi",
];

// id field file → kolom khusus. "single" simpan URL string, "multi" simpan array URL.
export const RESERVED_FILE_COLUMNS = {
  buktiFollow: "single",
  fotoKtm: "multi",
};

export const DEFAULT_FORM_SCHEMA = [
  { id: "universitas", label: "Universitas", type: "text", required: true, placeholder: "Nama universitas" },
  { id: "fakultas", label: "Fakultas", type: "text", required: true, placeholder: "Nama fakultas" },
  { id: "jurusan", label: "Program Studi", type: "text", required: true, placeholder: "Nama program studi" },
  { id: "kotaDomisili", label: "Kota Domisili", type: "text", required: true, placeholder: "Kota tempat tinggal" },
  { id: "provinsi", label: "Provinsi", type: "text", required: true, placeholder: "Nama provinsi" },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "nama@email.com", locked: true },
  { id: "no_wa", label: "Nomor WhatsApp", type: "tel", required: true, placeholder: "081234567890" },
  { id: "buktiFollow", label: "Bukti Follow IG @himti", type: "file", required: true, help: "Screenshot follow akun @himti (1 gambar)." },
  { id: "buktiFollowItfest", label: "Bukti Follow IG @itfest", type: "file", required: true, help: "Screenshot follow akun @itfest (1 gambar)." },
  { id: "fotoKtm", label: "Foto KTM (Seluruh Anggota)", type: "files", required: true, help: "Bisa pilih beberapa file sekaligus (1 KTM per anggota)." },
];

// Skema aktif buat sebuah event. formSchema null/kosong → pakai default (backward compat).
export function getFormSchema(event) {
  const s = event?.formSchema;
  return Array.isArray(s) && s.length ? s : DEFAULT_FORM_SCHEMA;
}

export function isFileField(f) {
  return f.type === "file" || f.type === "files";
}

// Bikin id unik dari label (buat field baru di builder).
export function slugifyFieldId(label, existing = []) {
  let base =
    (label || "field")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "") || "field";
  let id = base;
  let n = 1;
  while (existing.includes(id)) id = `${base}_${++n}`;
  return id;
}
