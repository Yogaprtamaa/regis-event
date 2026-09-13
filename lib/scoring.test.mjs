// Cek gerbang pengumuman finalis: publish doang gak cukup, tanggal wajib lewat.
// Jalanin: node lib/scoring.test.mjs
import assert from "node:assert/strict";
import { isAnnounced, formatTanggalPengumuman, rankSubmissions } from "./scoring.js";

const kemarin = new Date(Date.now() - 86400000);
const besok = new Date(Date.now() + 86400000);

assert.equal(isAnnounced(null), false, "belum ada baris publish");
assert.equal(isAnnounced({ published: false, announceAt: kemarin }), false, "tanggal lewat tapi belum dipublish");
assert.equal(isAnnounced({ published: true, announceAt: null }), false, "dipublish tapi tanggal kosong");
assert.equal(isAnnounced({ published: true, announceAt: besok }), false, "dipublish tapi belum waktunya");
assert.equal(isAnnounced({ published: true, announceAt: kemarin }), true, "dipublish & tanggal lewat");

assert.equal(formatTanggalPengumuman(null), null);
assert.equal(formatTanggalPengumuman("2026-09-21T12:00:00.000Z"), "21 September 2026");

// Skor akhir = rata-rata nilai seluruh juri, bukan jumlah (maks 100).
const kriteria = [
  { id: "c1", bobot: 60 },
  { id: "c2", bobot: 40 },
];
const nilaiJuri = (c1, c2) => ({ items: [{ criteriaId: "c1", nilai: c1 }, { criteriaId: "c2", nilai: c2 }] });

const hasil = rankSubmissions(
  [
    // 3 juri, masing-masing 80 → rata-rata 80
    { id: "a", scores: [nilaiJuri(80, 80), nilaiJuri(80, 80), nilaiJuri(80, 80)] },
    // 2 juri, masing-masing 90 → rata-rata 90 (peringkat di atas A walau baru 2 juri)
    { id: "b", scores: [nilaiJuri(90, 90), nilaiJuri(90, 90)] },
    { id: "c", scores: [] },
  ],
  kriteria,
);

assert.deepEqual(hasil.map((s) => s.id), ["b", "a", "c"], "urut dari rata-rata terbesar");
assert.equal(hasil[0].totalScore, 90);
assert.equal(hasil[0].juriCount, 2);
assert.equal(hasil[1].totalScore, 80);
assert.equal(hasil[2].totalScore, null, "belum dinilai sama sekali");

// Bobot dinormalisasi, jadi satu juri tetap maksimal 100 walau bobot tak genap 100.
const [satu] = rankSubmissions(
  [{ id: "x", scores: [nilaiJuri(100, 100)] }],
  [{ id: "c1", bobot: 30 }, { id: "c2", bobot: 30 }],
);
assert.equal(satu.totalScore, 100);

console.log("ok");
