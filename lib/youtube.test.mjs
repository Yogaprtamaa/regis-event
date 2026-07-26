// Cek parser link YouTube buat video tata cara.
// Jalanin: node lib/youtube.test.mjs
import assert from "node:assert/strict";
import { youtubeId, youtubeEmbedUrl } from "./youtube.js";

assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ?t=42"), "dQw4w9WgXcQ");
assert.equal(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc"), "dQw4w9WgXcQ");

// Bukan link YouTube / belum diisi → null, UI nampilin placeholder.
assert.equal(youtubeId(""), null);
assert.equal(youtubeId(null), null);
assert.equal(youtubeId("https://drive.google.com/file/d/abc/view"), null);
// ID harus tepat 11 karakter — potongan yang kepanjangan jangan diterima.
assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQQQQ"), null);

assert.equal(
  youtubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ"),
  "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
);
assert.equal(youtubeEmbedUrl(""), null);

console.log("ok");
