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

// Skor akhir = jumlah nilai seluruh juri, bukan rata-rata.
const kriteria = [
  { id: "c1", bobot: 60 },
  { id: "c2", bobot: 40 },
];
const nilaiJuri = (c1, c2) => ({ items: [{ criteriaId: "c1", nilai: c1 }, { criteriaId: "c2", nilai: c2 }] });

const hasil = rankSubmissions(
  [
    // 3 juri, masing-masing 80 → total 240
    { id: "a", scores: [nilaiJuri(80, 80), nilaiJuri(80, 80), nilaiJuri(80, 80)] },
    // 2 juri, masing-masing 90 → total 180 (rata-rata 90, tapi peringkatnya di bawah A)
    { id: "b", scores: [nilaiJuri(90, 90), nilaiJuri(90, 90)] },
    { id: "c", scores: [] },
  ],
  kriteria,
);

assert.deepEqual(hasil.map((s) => s.id), ["a", "b", "c"], "urut dari total terbesar");
assert.equal(hasil[0].totalScore, 240);
assert.equal(hasil[0].juriCount, 3);
assert.equal(hasil[1].totalScore, 180);
assert.equal(hasil[2].totalScore, null, "belum dinilai sama sekali");

// Bobot dinormalisasi, jadi satu juri tetap maksimal 100 walau bobot tak genap 100.
const [satu] = rankSubmissions(
  [{ id: "x", scores: [nilaiJuri(100, 100)] }],
  [{ id: "c1", bobot: 30 }, { id: "c2", bobot: 30 }],
);
assert.equal(satu.totalScore, 100);

console.log("ok");
