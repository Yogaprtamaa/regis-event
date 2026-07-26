// Cek pembacaan bucket + path dari URL berkas yang tersimpan di DB.
// Jalanin: NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co node lib/storage.test.mjs
import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://x.supabase.co";
const { parseStoragePath } = await import("./storage.js");

const B = "https://x.supabase.co/storage/v1/object/public";

assert.deepEqual(parseStoragePath(`${B}/participant-uploads/kti/bukti-123-45.png`), {
  bucket: "participant-uploads",
  path: "kti/bukti-123-45.png",
});
assert.deepEqual(parseStoragePath(`${B}/karya-submissions/KTI/karya-1-2.pdf`), {
  bucket: "karya-submissions",
  path: "KTI/karya-1-2.pdf",
});
// Spasi ter-encode harus dikembalikan apa adanya, kalau tidak path-nya meleset.
assert.deepEqual(parseStoragePath(`${B}/participant-uploads/fun%20game/ktm-1.jpg`), {
  bucket: "participant-uploads",
  path: "fun game/ktm-1.jpg",
});

// Bukan berkas kita → null, supaya link luar tidak diutak-atik.
assert.equal(parseStoragePath("https://drive.google.com/drive/folders/abc"), null);
assert.equal(parseStoragePath("https://youtu.be/dQw4w9WgXcQ"), null);
assert.equal(parseStoragePath(""), null);
assert.equal(parseStoragePath(null), null);
// Domain lain yang meniru bentuk path juga harus ditolak.
assert.equal(
  parseStoragePath("https://jahat.example/storage/v1/object/public/participant-uploads/a.png"),
  null,
);
// Bucket tanpa path, dan path kosong.
assert.equal(parseStoragePath(`${B}/participant-uploads`), null);
assert.equal(parseStoragePath(`${B}/participant-uploads/`), null);

console.log("ok");
