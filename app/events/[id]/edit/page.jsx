'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, PencilSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Loading from "@/app/loading";
import { DEFAULT_FORM_SCHEMA, FIELD_TYPES, slugifyFieldId } from "@/lib/formSchema";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
  body {
    background-color: #FDF5E4;
    background-image:
      repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px),
      repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px);
    background-size: 28px 28px;
  }
  .font-fredoka { font-family: 'Fredoka', sans-serif; }
  .b-border    { border: 3px solid #1a1a1a; }
  .b-border-2  { border: 2px solid #1a1a1a; }
  .b-shadow    { box-shadow: 8px 8px 0px #1a1a1a; }
  .b-shadow-sm { box-shadow: 4px 4px 0px #1a1a1a; }
  .b-btn       { transition: all 0.12s ease; }
  .b-btn:hover { transform: translate(2px,2px); box-shadow: 0px 0px 0px #1a1a1a !important; }
  .b-btn:active { transform: translate(3px,3px); box-shadow: 0px 0px 0px #1a1a1a !important; }
  .bg-dots {
    background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.04;
    pointer-events: none;
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bar     { from{width:0} }
  @keyframes bounce1 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
  .c-fadeUp { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .c-bar    { animation: bar 1.2s ease both; }
`;

const FORM_FIELDS = [
  { key: "nama_event", label: "Judul Event", placeholder: "Workshop Web Development", type: "text", icon: PencilSquareIcon, required: true, fullWidth: true },
  { key: "deskripsi", label: "Deskripsi", placeholder: "Jelaskan tentang event yang akan diselenggarakan...", type: "textarea", icon: null, required: true, fullWidth: true },
  { key: "tanggal", label: "Tanggal", placeholder: "", type: "date", icon: CalendarIcon, required: true },
  { key: "jam_mulai", label: "Jam Mulai", placeholder: "", type: "time", icon: ClockIcon, required: true },
  { key: "jam_berakhir", label: "Jam Berakhir", placeholder: "", type: "time", icon: ClockIcon, required: true, fullWidth: true },
  { key: "lokasi", label: "Lokasi", placeholder: "Auditorium Kampus", type: "text", icon: MapPinIcon, required: true, fullWidth: true },
  { key: "kapasitas", label: "Kuota Peserta", placeholder: "50", type: "number", icon: UsersIcon, required: true },
  { key: "status", label: "Status", placeholder: "", type: "select", icon: null, required: false, options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "CLOSED", label: "Closed" }] },
  { key: "panduanUrl", label: "Link Buku Panduan", placeholder: "https://drive.google.com/...", type: "url", icon: BookOpenIcon, required: false, fullWidth: true },
  { key: "waGroupLink", label: "Link Grup WhatsApp", placeholder: "https://chat.whatsapp.com/...", type: "url", icon: ChatBubbleLeftRightIcon, required: false, fullWidth: true },
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;
  const [formData, setFormData] = useState({
    nama_event: '',
    deskripsi: '',
    tanggal: '',
    jam_mulai: '',
    jam_berakhir: '',
    lokasi: '',
    kapasitas: '',
    status: 'DRAFT',
    panduanUrl: '',
    waGroupLink: '',
  });
  // Form-builder: kolom formulir pendaftaran
  const [fields, setFields] = useState(DEFAULT_FORM_SCHEMA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error('Event tidak ditemukan');
        const event = await res.json();
        if (!event) throw new Error('Event tidak ditemukan');
        setFormData({
          nama_event: event.nama_event || '',
          deskripsi: event.deskripsi || '',
          tanggal: event.tanggal ? event.tanggal.split('T')[0] : '',
          jam_mulai: event.jam_mulai || '',
          jam_berakhir: event.jam_berakhir || '',
          lokasi: event.lokasi || '',
          kapasitas: event.kapasitas || '',
          status: event.status || 'DRAFT',
          panduanUrl: event.panduanUrl || '',
          waGroupLink: event.waGroupLink || '',
        });
        if (Array.isArray(event.formSchema) && event.formSchema.length) {
          setFields(event.formSchema);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (loading) return <Loading />;

  if (error && !formData.nama_event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <style>{CSS}</style>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white b-border rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ boxShadow: '6px 6px 0 #1a1a1a' }}>
            <PencilSquareIcon className="w-9 h-9 text-slate-400" strokeWidth={2} />
          </div>
          <h1 className="font-fredoka text-2xl font-bold text-slate-900">Event Tidak Ditemukan</h1>
          <p className="text-sm font-bold text-slate-400 mt-2 mb-6">Event yang kamu cari tidak tersedia atau sudah dihapus.</p>
          <a href="/events" className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider" style={{ boxShadow: '4px 4px 0 #1a1a1a' }}>
            ← Kembali ke Events
          </a>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kapasitas' ? (value === '' ? '' : parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!formData.nama_event || !formData.deskripsi || !formData.tanggal || !formData.jam_mulai || !formData.jam_berakhir || !formData.lokasi || !formData.kapasitas) {
        setError("Semua field harus diisi!");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_event: formData.nama_event,
          deskripsi: formData.deskripsi,
          tanggal: formData.tanggal,
          jam_mulai: formData.jam_mulai,
          jam_berakhir: formData.jam_berakhir,
          lokasi: formData.lokasi,
          kapasitas: parseInt(formData.kapasitas, 10),
          status: formData.status,
          panduanUrl: formData.panduanUrl,
          waGroupLink: formData.waGroupLink,
          formSchema: fields,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan perubahan');
      }

      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Form-builder handlers ──
  const updateField = (i, patch) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const removeField = (i) =>
    setFields((prev) => prev.filter((_, idx) => idx !== i));

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

  const completedFields = [formData.nama_event, formData.deskripsi, formData.tanggal, formData.jam_mulai, formData.jam_berakhir, formData.lokasi, formData.kapasitas].filter(Boolean).length;
  const pct = Math.round((completedFields / 7) * 100);

  return (
    <div className="min-h-screen">
      <style>{CSS}</style>

      {/* Hero header */}
      <div className="relative overflow-hidden" style={{ background: "#31AECE", borderBottom: "3px solid #1a1a1a" }}>
        {/* Big letter watermark */}
        <div className="font-fredoka absolute right-4 -bottom-6 font-bold text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "clamp(8rem, 22vw, 16rem)" }}>
          ✎
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Back button */}
          <a href={`/events/${eventId}`}
            className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black w-fit uppercase tracking-wider mb-8"
            style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
            <ArrowLeftIcon className="w-4 h-4" strokeWidth={3} />
            Kembali
          </a>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white b-border rounded-2xl flex items-center justify-center shrink-0"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
              <PencilSquareIcon className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Edit Formulir</p>
              <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-white"
                style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}>
                Edit Event<span style={{ color: "#FED245" }}>.</span>
              </h1>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-3 overflow-hidden rounded-full b-border-2 bg-white/30">
              <div className="h-full rounded-full c-bar"
                style={{
                  width: `${pct}%`,
                  background: "#FED245",
                  borderRight: pct > 0 && pct < 100 ? "3px solid #1a1a1a" : "none",
                  transition: "width 0.55s cubic-bezier(.22,1,.36,1)",
                }} />
            </div>
            <span className="text-white font-black text-xs tabular-nums"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}>
              {completedFields}/7
            </span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        <div className="c-fadeUp bg-white b-border b-shadow overflow-hidden rounded-[2rem]">
          <div className="p-6 sm:p-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 b-border rounded-2xl flex items-start gap-3"
                style={{ boxShadow: "3px 3px 0 #f87171" }}>
                <PencilSquareIcon className="w-5 h-5 flex-shrink-0 text-red-500" strokeWidth={2.5} />
                <div>
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest">Error</p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Render fields */}
              {(() => {
                const elements = [];
                let i = 0;
                while (i < FORM_FIELDS.length) {
                  const field = FORM_FIELDS[i];
                  if (field.fullWidth) {
                    elements.push(
                      <FieldInput key={field.key} field={field} value={formData[field.key]} onChange={handleChange} />
                    );
                    i++;
                  } else {
                    const next = FORM_FIELDS[i + 1];
                    if (next && !next.fullWidth) {
                      elements.push(
                        <div key={`grid-${field.key}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FieldInput field={field} value={formData[field.key]} onChange={handleChange} />
                          <FieldInput field={next} value={formData[next.key]} onChange={handleChange} />
                        </div>
                      );
                      i += 2;
                    } else {
                      elements.push(
                        <FieldInput key={field.key} field={field} value={formData[field.key]} onChange={handleChange} />
                      );
                      i++;
                    }
                  }
                }
                return elements;
              })()}

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              {/* ── Form-builder: kolom formulir pendaftaran ── */}
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

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                style={{ background: "#31AECE", boxShadow: "4px 4px 0 #1a1a1a" }}>
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckBadgeIcon className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 pb-6">
            <div className="flex items-center gap-2.5 bg-slate-50 b-border rounded-2xl px-4 py-3">
              <span className="text-sm">💡</span>
              <p className="text-[11px] font-black text-slate-500">
                Perubahan akan langsung berlaku setelah disimpan
              </p>
            </div>
          </div>
        </div>
      </div>
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

function FieldInput({ field, value, onChange }) {
  const { key, label, placeholder, type, icon: Icon, required, options } = field;

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all b-border bg-white text-slate-900";
  const inputStyle = { boxShadow: "3px 3px 0 #1a1a1a" };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          name={key}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="4"
          required={required}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      ) : type === "select" ? (
        <select
          name={key}
          value={value}
          onChange={onChange}
          className={`${inputClass} cursor-pointer`}
          style={inputStyle}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={key}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={type === "number" ? "1" : undefined}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </div>
  );
}
