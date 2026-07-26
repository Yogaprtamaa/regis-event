// Cek gerbang pengumuman finalis: publish doang gak cukup, tanggal wajib lewat.
// Jalanin: node lib/scoring.test.mjs
import assert from "node:assert/strict";
import { isAnnounced, formatTanggalPengumuman } from "./scoring.js";

const kemarin = new Date(Date.now() - 86400000);
const besok = new Date(Date.now() + 86400000);

assert.equal(isAnnounced(null), false, "belum ada baris publish");
assert.equal(isAnnounced({ published: false, announceAt: kemarin }), false, "tanggal lewat tapi belum dipublish");
assert.equal(isAnnounced({ published: true, announceAt: null }), false, "dipublish tapi tanggal kosong");
assert.equal(isAnnounced({ published: true, announceAt: besok }), false, "dipublish tapi belum waktunya");
assert.equal(isAnnounced({ published: true, announceAt: kemarin }), true, "dipublish & tanggal lewat");

assert.equal(formatTanggalPengumuman(null), null);
assert.equal(formatTanggalPengumuman("2026-09-21T12:00:00.000Z"), "21 September 2026");

console.log("ok");
