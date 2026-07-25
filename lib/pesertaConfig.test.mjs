// Cek normalisasi pengaturan data peserta (input admin gak dipercaya mentah).
// Jalanin: node lib/pesertaConfig.test.mjs
import assert from "node:assert/strict";
import { getPesertaConfig, defaultJenisPeserta, DEFAULT_PESERTA_CONFIG } from "./pesertaConfig.js";

assert.deepEqual(getPesertaConfig(null), DEFAULT_PESERTA_CONFIG);
assert.deepEqual(getPesertaConfig({ pesertaConfig: { mode: "kelompok", maxAnggota: "5", nim: "off" } }), {
  mode: "kelompok",
  maxAnggota: 5,
  nim: "off",
});
// Nilai ngawur dari klien jatuh ke default
assert.deepEqual(getPesertaConfig({ pesertaConfig: { mode: "xx", maxAnggota: 99, nim: "yy" } }), DEFAULT_PESERTA_CONFIG);

assert.equal(defaultJenisPeserta({ mode: "kelompok" }), "kelompok");
assert.equal(defaultJenisPeserta({ mode: "both" }), "individu");

console.log("ok");
