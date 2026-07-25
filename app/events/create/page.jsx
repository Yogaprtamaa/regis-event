"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import FormBuilder from "@/app/components/FormBuilder";
import PesertaConfigFields from "@/app/components/PesertaConfigFields";
import { DEFAULT_FORM_SCHEMA } from "@/lib/formSchema";
import { DEFAULT_PESERTA_CONFIG } from "@/lib/pesertaConfig";

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
  .b-shadow-md { box-shadow: 6px 6px 0px #1a1a1a; }
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
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bar    { from{width:0} }
  .c-fadeUp { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .c-bar    { animation: bar 1.2s ease both; }
`;

const FORM_FIELDS = [
  {
    key: "nama_event",
    label: "Judul Event",
    placeholder: "Workshop Web Development",
    type: "text",
    icon: BoltIcon,
    required: true,
    fullWidth: true,
  },
  {
    key: "deskripsi",
    label: "Deskripsi",
    placeholder: "Jelaskan tentang event yang akan diselenggarakan...",
    type: "textarea",
    icon: null,
    required: true,
    fullWidth: true,
  },
  {
    key: "tanggal",
    label: "Tanggal",
    placeholder: "",
    type: "date",
    icon: CalendarIcon,
    required: true,
    fullWidth: true,
  },
  {
    key: "jam_mulai",
    label: "Jam Mulai",
    placeholder: "",
    type: "time",
    icon: ClockIcon,
    required: true,
  },
  {
    key: "jam_berakhir",
    label: "Jam Berakhir",
    placeholder: "",
    type: "time",
    icon: ClockIcon,
    required: true,
  },
  {
    key: "lokasi",
    label: "Lokasi",
    placeholder: "Auditorium Kampus",
    type: "text",
    icon: MapPinIcon,
    required: true,
    fullWidth: true,
  },
  {
    key: "kapasitas",
    label: "Kuota Peserta",
    placeholder: "50",
    type: "number",
    icon: UsersIcon,
    required: true,
  },
  {
    key: "status",
    label: "Status",
    placeholder: "",
    type: "select",
    icon: null,
    required: false,
    options: [
      { value: "DRAFT", label: "📝 Draft" },
      { value: "PUBLISHED", label: "🚀 Published" },
    ],
  },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_event: "",
    deskripsi: "",
    tanggal: "",
    jam_mulai: "",
    jam_berakhir: "",
    lokasi: "",
    kapasitas: 50,
    status: "DRAFT",
    isPaidEvent: false,
  });
  // Form-builder: kolom formulir pendaftaran
  const [fields, setFields] = useState(DEFAULT_FORM_SCHEMA);
  const [pesertaConfig, setPesertaConfig] = useState(DEFAULT_PESERTA_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "kapasitas"
          ? value === ""
            ? ""
            : parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !formData.nama_event ||
        !formData.deskripsi ||
        !formData.tanggal ||
        !formData.jam_mulai ||
        !formData.jam_berakhir ||
        !formData.lokasi ||
        !formData.kapasitas
      ) {
        setError("Semua field harus diisi!");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_event: formData.nama_event,
          deskripsi: formData.deskripsi,
          tanggal: formData.tanggal,
          jam_mulai: formData.jam_mulai,
          jam_berakhir: formData.jam_berakhir,
          lokasi: formData.lokasi,
          kapasitas: parseInt(formData.kapasitas, 10),
          isPaidEvent: formData.isPaidEvent,
          formSchema: fields,
          pesertaConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal membuat event");
      }

      await response.json();
      router.push("/events");
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message || "Terjadi kesalahan saat membuat event");
    } finally {
      setLoading(false);
    }
  };

  const completedFields = [
    formData.nama_event,
    formData.deskripsi,
    formData.tanggal,
    formData.jam_mulai,
    formData.jam_berakhir,
    formData.lokasi,
    formData.kapasitas,
  ].filter(Boolean).length;
  const pct = Math.round((completedFields / 7) * 100);

  return (
    <div className="min-h-screen">
      <style>{CSS}</style>

      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#EB3C6B", borderBottom: "3px solid #1a1a1a" }}
      >
        {/* Big letter watermark */}
        <div
          className="font-fredoka absolute right-4 -bottom-6 font-bold text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "clamp(8rem, 22vw, 16rem)" }}
        >
          +
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Back button */}
          <a
            href="/events"
            className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black w-fit uppercase tracking-wider mb-8"
            style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
          >
            <ArrowLeftIcon className="w-4 h-4" strokeWidth={3} />
            Kembali
          </a>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 bg-white b-border rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
            >
              <BoltIcon className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                Formulir Baru
              </p>
              <h1
                className="font-fredoka text-3xl sm:text-4xl font-bold text-white"
                style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}
              >
                Buat Event<span className="text-black">.</span>
              </h1>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-3 overflow-hidden rounded-full b-border-2 bg-white/30">
              <div
                className="h-full rounded-full c-bar"
                style={{
                  width: `${pct}%`,
                  background: "#fff",
                  borderRight:
                    pct > 0 && pct < 100 ? "3px solid #1a1a1a" : "none",
                  transition: "width 0.55s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
            <span
              className="text-white font-black text-xs tabular-nums"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}
            >
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
              <div
                className="mb-6 p-4 bg-red-100 b-border rounded-2xl flex items-start gap-3"
                style={{ boxShadow: "3px 3px 0 #f87171" }}
              >
                <BoltIcon className="w-5 h-5 flex-shrink-0 text-red-500" strokeWidth={2.5} />
                <div>
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest">
                    Error
                  </p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">
                    {error}
                  </p>
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
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={formData[field.key]}
                        onChange={handleChange}
                      />,
                    );
                    i++;
                  } else {
                    // Check if next field is also not fullWidth → pair them
                    const next = FORM_FIELDS[i + 1];
                    if (next && !next.fullWidth) {
                      elements.push(
                        <div
                          key={`grid-${field.key}`}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <FieldInput
                            field={field}
                            value={formData[field.key]}
                            onChange={handleChange}
                          />
                          <FieldInput
                            field={next}
                            value={formData[next.key]}
                            onChange={handleChange}
                          />
                        </div>,
                      );
                      i += 2;
                    } else {
                      elements.push(
                        <FieldInput
                          key={field.key}
                          field={field}
                          value={formData[field.key]}
                          onChange={handleChange}
                        />,
                      );
                      i++;
                    }
                  }
                }
                return elements;
              })()}

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              {/* Paid Event Toggle */}
              <div className="bg-yellow-50 b-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Tipe Event
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    Event Berbayar
                  </p>
                  <p className="text-xs text-slate-500">
                    Jika aktif, peserta harus upload bukti pembayaran
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPaidEvent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPaidEvent: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-black"
                  />
                  <span className="text-sm font-black">
                    {formData.isPaidEvent ? "BERBAYAR" : "GRATIS"}
                  </span>
                </label>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              {/* ── Form-builder: kolom formulir pendaftaran ── */}
              <PesertaConfigFields value={pesertaConfig} onChange={setPesertaConfig} />

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              <FormBuilder fields={fields} setFields={setFields} />

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200" />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                style={{
                  background: "#EB3C6B",
                  boxShadow: "4px 4px 0 #1a1a1a",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Membuat Event...
                  </>
                ) : (
                  <>
                    <CheckBadgeIcon className="w-5 h-5" />
                    Buat Event Sekarang
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
                Event dengan status{" "}
                <span className="text-slate-900">Draft</span> tidak akan
                ditampilkan ke peserta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const {
    key,
    label,
    placeholder,
    type,
    icon: Icon,
    required,
    options,
  } = field;

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all b-border bg-white text-slate-900";
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
          style={inputStyle}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
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
