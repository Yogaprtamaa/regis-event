// Cek batas tutup pendaftaran. Jalanin: node lib/eventStatus.test.mjs
import assert from "node:assert/strict";
import { pendaftaranDitutup } from "./eventStatus.js";

const akhir = "2026-08-14T00:00:00.000Z"; // hari terakhir: 14 Agu

// Masih hari terakhir (14 Agu 23:00 WIB = 16:00Z) → buka.
assert.equal(pendaftaranDitutup(akhir, Date.parse("2026-08-14T16:00:00Z")), false);
// Lewat tengah malam WIB (15 Agu 00:30 WIB = 14 Agu 17:30Z) → tutup.
assert.equal(pendaftaranDitutup(akhir, Date.parse("2026-08-14T17:30:00Z")), true);
// Tanpa tanggal → jangan tutup sendiri.
assert.equal(pendaftaranDitutup(null), false);
assert.equal(pendaftaranDitutup("bukan-tanggal"), false);

console.log("ok");
