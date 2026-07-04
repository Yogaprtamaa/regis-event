"use client";
import { useState } from "react";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";

const KATEGORI = [
  { value: "HACKATHON", label: "Hackathon" },
  { value: "KTI", label: "Karya Tulis Ilmiah" },
  { value: "IOT", label: "Internet of Things" },
  { value: "GAME_MAKING", label: "Game Making" },
];

function parseAnggota(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nama, nim] = line.split("-").map((s) => s.trim());
      return { nama: nama || line, nim: nim || null };
    });
}

export default function SubmitKaryaPage() {
  const [form, setForm] = useState({
    kategori: "HACKATHON",
    namaTim: "",
    ketuaNama: "",
    ketuaNim: "",
    ketuaEmail: "",
    judulKarya: "",
    deskripsi: "",
    anggotaRaw: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("File karya wajib diunggah.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("kategori", form.kategori);
      fd.append("namaTim", form.namaTim);
      fd.append("ketuaNama", form.ketuaNama);
      fd.append("ketuaNim", form.ketuaNim);
      fd.append("ketuaEmail", form.ketuaEmail);
      fd.append("judulKarya", form.judulKarya);
      fd.append("deskripsi", form.deskripsi);
      fd.append("anggota", JSON.stringify(parseAnggota(form.anggotaRaw)));
      fd.append("fileKarya", file);

      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengirim karya");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="adm-bg min-h-screen flex items-center justify-center p-4">
        <RetroAdminStyles />
        <div className="pop-in adm-card sh-lime max-w-md w-full p-8 text-center">
          <span className="adm-tag" style={{ background: C.lime }}>
            Terkirim!
          </span>
          <h1 className="fd text-3xl font-bold mt-4" style={{ color: C.navy }}>
            Karya kamu udah masuk 🎉
          </h1>
          <p className="fb text-sm font-semibold mt-3" style={{ color: C.muted }}>
            Panitia bakal seleksi berkas dulu sebelum diteruskan ke juri kategori. Pantau email tim buat info lanjutan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-bg min-h-screen p-4">
      <RetroAdminStyles />
      <div className="max-w-2xl mx-auto py-10">
        <div className="pop-in adm-card sh-coral px-6 py-6 sm:px-8 mb-6">
          <span className="adm-tag" style={{ background: C.coral, color: "#fff" }}>
            IT FEST 6.0 · Kumpul Karya
          </span>
          <h1 className="fd text-4xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
            Submit Karya Lomba
          </h1>
          <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
            Isi data tim dan unggah file karya sesuai kategori lomba yang diikuti.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pop-in adm-card sh-navy px-6 py-7 sm:px-8 space-y-5" style={{ "--d": "100ms" }}>
          <div>
            <label className="adm-label fb">Kategori Lomba</label>
            <select
              className="adm-input"
              value={form.kategori}
              onChange={(e) => update("kategori", e.target.value)}
            >
              {KATEGORI.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="adm-label fb">Nama Tim</label>
            <input
              className="adm-input" required
              value={form.namaTim}
              onChange={(e) => update("namaTim", e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="adm-label fb">Nama Ketua</label>
              <input
                className="adm-input" required
                value={form.ketuaNama}
                onChange={(e) => update("ketuaNama", e.target.value)}
              />
            </div>
            <div>
              <label className="adm-label fb">NIM Ketua</label>
              <input
                className="adm-input"
                value={form.ketuaNim}
                onChange={(e) => update("ketuaNim", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="adm-label fb">Email Ketua</label>
            <input
              type="email" className="adm-input" required
              value={form.ketuaEmail}
              onChange={(e) => update("ketuaEmail", e.target.value)}
            />
          </div>

          <div>
            <label className="adm-label fb">Anggota Lain (opsional)</label>
            <textarea
              className="adm-input" rows={3}
              placeholder={"Satu orang per baris, format: Nama - NIM\nContoh: Budi Santoso - 2201234567"}
              value={form.anggotaRaw}
              onChange={(e) => update("anggotaRaw", e.target.value)}
            />
          </div>

          <div>
            <label className="adm-label fb">Judul Karya</label>
            <input
              className="adm-input" required
              value={form.judulKarya}
              onChange={(e) => update("judulKarya", e.target.value)}
            />
          </div>

          <div>
            <label className="adm-label fb">Deskripsi Singkat (opsional)</label>
            <textarea
              className="adm-input" rows={3}
              value={form.deskripsi}
              onChange={(e) => update("deskripsi", e.target.value)}
            />
          </div>

          <div>
            <label className="adm-label fb">File Karya (PDF/ZIP, maks sesuai ketentuan lomba)</label>
            <input
              type="file" required className="adm-input"
              accept=".pdf,.zip,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && (
            <div className="stamp-in adm-card px-4 py-3" style={{ borderColor: C.coral, boxShadow: `4px 4px 0 ${C.coral}` }} role="alert">
              <p className="fb text-sm font-extrabold" style={{ color: C.coral }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="adm-btn w-full text-lg py-3" style={{ background: C.coral, color: "#fff" }}>
            {loading ? "Mengirim..." : "Kirim Karya →"}
          </button>
        </form>
      </div>
    </div>
  );
}
