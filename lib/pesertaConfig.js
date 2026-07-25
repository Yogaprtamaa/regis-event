// Pengaturan blok "Data Peserta" di formulir pendaftaran, diatur admin per event.
//   mode      : "both" (peserta pilih sendiri) | "individu" | "kelompok"
//   maxAnggota: batas orang dalam 1 kelompok
//   nim       : "required" | "optional" | "off" (kolom NIM dihapus dari form)
export const DEFAULT_PESERTA_CONFIG = {
  mode: "both",
  maxAnggota: 3,
  nim: "required",
};

const MODES = ["both", "individu", "kelompok"];
const NIM_OPTS = ["required", "optional", "off"];

export function getPesertaConfig(event) {
  const c = event?.pesertaConfig || {};
  const maxAnggota = Number(c.maxAnggota);
  return {
    mode: MODES.includes(c.mode) ? c.mode : DEFAULT_PESERTA_CONFIG.mode,
    maxAnggota: maxAnggota >= 1 && maxAnggota <= 10 ? Math.floor(maxAnggota) : DEFAULT_PESERTA_CONFIG.maxAnggota,
    nim: NIM_OPTS.includes(c.nim) ? c.nim : DEFAULT_PESERTA_CONFIG.nim,
  };
}

// Jenis peserta awal/paksaan sesuai mode.
export function defaultJenisPeserta(cfg) {
  return cfg.mode === "kelompok" ? "kelompok" : "individu";
}
