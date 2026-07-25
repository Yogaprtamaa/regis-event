"use client";

import { UsersIcon } from "@heroicons/react/24/outline";

// Pengaturan blok "Data Peserta" di formulir pendaftaran — dipakai di create & edit event.
export default function PesertaConfigFields({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  const labelCls = "block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2";
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-bold b-border bg-white text-slate-900 focus:outline-none";
  const inputStyle = { boxShadow: "3px 3px 0 #1a1a1a" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 uppercase tracking-wider">
        <UsersIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> Pengaturan Data Peserta
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Jenis Pendaftaran</label>
          <select
            className={inputCls + " cursor-pointer"}
            style={inputStyle}
            value={value.mode}
            onChange={(e) => set({ mode: e.target.value })}
          >
            <option value="both">Peserta pilih sendiri</option>
            <option value="individu">Individu saja</option>
            <option value="kelompok">Kelompok saja</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Maks. Anggota Kelompok</label>
          <input
            type="number" min="1" max="10"
            className={inputCls}
            style={inputStyle}
            value={value.maxAnggota}
            onChange={(e) => set({ maxAnggota: parseInt(e.target.value, 10) || 1 })}
            disabled={value.mode === "individu"}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Kolom NIM</label>
        <select
          className={inputCls + " cursor-pointer"}
          style={inputStyle}
          value={value.nim}
          onChange={(e) => set({ nim: e.target.value })}
        >
          <option value="required">Tampilkan &amp; wajib diisi</option>
          <option value="optional">Tampilkan, boleh kosong</option>
          <option value="off">Hapus kolom NIM</option>
        </select>
        <p className="text-[11px] font-bold text-slate-400 mt-1.5">
          Kolom Nama selalu ada — dipakai sebagai identitas peserta.
        </p>
      </div>
    </div>
  );
}
