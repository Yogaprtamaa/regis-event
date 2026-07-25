// Cek cepat pemetaan nama event → kategori → berkas yang diminta.
// Jalanin: node lib/kategori.test.mjs
import assert from "node:assert/strict";
import { kategoriFromEventName, karyaRequirements } from "./kategori.js";

assert.equal(kategoriFromEventName("Karya Tulis Ilmiah (KTI)"), "KTI");
assert.equal(kategoriFromEventName("Hackathon"), "HACKATHON");
assert.equal(kategoriFromEventName("Internet of Things (IoT)"), "IOT");
assert.equal(kategoriFromEventName("Fun Game"), null);

// Hackathon: PDF + repo + video. IoT: PDF + video. KTI: PDF (video opsional).
assert.equal(karyaRequirements("HACKATHON").linkRepo, "required");
assert.equal(karyaRequirements("HACKATHON").linkVideo, "required");
assert.equal(karyaRequirements("IOT").linkRepo, "off");
assert.equal(karyaRequirements("IOT").linkVideo, "required");
assert.equal(karyaRequirements("KTI").linkRepo, "off");
assert.equal(karyaRequirements("KTI").linkVideo, "optional");

console.log("ok");
