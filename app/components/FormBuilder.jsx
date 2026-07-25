"use client";

import { PencilSquareIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { FIELD_TYPES, slugifyFieldId } from "@/lib/formSchema";

// Editor kolom formulir pendaftaran. Controlled: state `fields` dipegang parent.
// Dipakai di create & edit event — 1 sumber, biar gak beda perilaku.
export default function FormBuilder({ fields, setFields }) {
  const updateField = (i, patch) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const removeField = (i) => setFields((prev) => prev.filter((_, idx) => idx !== i));

  const moveField = (i, dir) =>
    setFields((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const addField = () =>
    setFields((prev) => [
      ...prev,
      {
        id: slugifyFieldId("field_baru", prev.map((f) => f.id)),
        label: "Field Baru",
        type: "text",
        required: false,
        placeholder: "",
      },
    ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 uppercase tracking-wider">
          <PencilSquareIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          Kolom Formulir Pendaftaran
        </label>
        <span className="text-[10px] font-black text-slate-400">{fields.length} kolom</span>
      </div>
      <p className="text-[11px] font-bold text-slate-400 mb-3">
        Atur kolom yang diisi peserta saat daftar. Tambah, hapus, urutkan, atau ubah tipe & label.
      </p>

      <div className="space-y-3">
        {fields.map((f, i) => (
          <FieldBuilderRow
            key={f.id}
            field={f}
            index={i}
            total={fields.length}
            onChange={(patch) => updateField(i, patch)}
            onRemove={() => removeField(i)}
            onMove={(dir) => moveField(i, dir)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addField}
        className="b-btn b-border w-full mt-3 py-2.5 rounded-xl text-xs font-black text-slate-700 bg-white uppercase tracking-wide flex items-center justify-center gap-1.5"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
      >
        <PlusIcon className="w-4 h-4" strokeWidth={3} /> Tambah Kolom
      </button>
    </div>
  );
}

function FieldBuilderRow({ field, index, total, onChange, onRemove, onMove }) {
  const locked = field.locked;
  const isSelect = field.type === "select";
  const smallInput = "w-full px-2.5 py-1.5 rounded-lg text-xs font-bold b-border-2 bg-white text-slate-900 focus:outline-none";

  return (
    <div className="p-3 rounded-xl b-border-2 bg-slate-50" style={{ boxShadow: "3px 3px 0 #1a1a1a" }}>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 pt-0.5">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
            className="w-6 h-6 rounded-md b-border-2 bg-white flex items-center justify-center disabled:opacity-30" aria-label="Naik">
            <ArrowUpIcon className="w-3 h-3" strokeWidth={3} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
            className="w-6 h-6 rounded-md b-border-2 bg-white flex items-center justify-center disabled:opacity-30" aria-label="Turun">
            <ArrowDownIcon className="w-3 h-3" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Label kolom"
            className={smallInput}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={field.type}
              onChange={(e) => onChange({ type: e.target.value })}
              disabled={locked}
              className={smallInput + " cursor-pointer disabled:opacity-60"}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 px-2">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="w-4 h-4"
              />
              Wajib diisi
            </label>
          </div>
          {isSelect && (
            <input
              type="text"
              value={(field.options || []).map((o) => (typeof o === "string" ? o : o.label)).join(", ")}
              onChange={(e) =>
                onChange({
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s) => ({ value: s, label: s })),
                })
              }
              placeholder="Pilihan, pisah koma: Ya, Tidak, Mungkin"
              className={smallInput}
            />
          )}
          {locked && (
            <p className="text-[10px] font-black text-slate-400">🔒 Kolom inti (email akun) — tipe & hapus dikunci.</p>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={locked}
          className="w-7 h-7 rounded-md b-border-2 bg-white flex items-center justify-center text-red-500 disabled:opacity-30"
          aria-label="Hapus kolom"
        >
          <TrashIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
