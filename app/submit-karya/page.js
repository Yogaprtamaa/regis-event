"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";

const STATUS_CFG = {
  APPROVED: { tag: "Terverifikasi", color: C.lime, text: C.navy, emoji: "✅" },
  PENDING: { tag: "Menunggu Verifikasi", color: C.yellow, text: C.navy, emoji: "⏳" },
  FREE: { tag: "Menunggu Verifikasi", color: C.yellow, text: C.navy, emoji: "⏳" },
  REJECTED: { tag: "Pembayaran Ditolak", color: C.coral, text: "#fff", emoji: "⛔" },
};

const MAX_KARYA_BYTES = 10 * 1024 * 1024; // 10MB, samain sama batas server di api/submissions

const SUBMISSION_CFG = {
  SUBMITTED: { tag: "Menunggu Seleksi Panitia", color: C.yellow, text: C.navy, emoji: "📥" },
  LOLOS_SELEKSI: { tag: "Lolos Seleksi Berkas", color: C.lime, text: C.navy, emoji: "✅" },
  TIDAK_LOLOS: { tag: "Tidak Lolos Seleksi Berkas", color: C.coral, text: "#fff", emoji: "⛔" },
};

export default function SubmitKaryaPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [mySubmission, setMySubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);

  const [form, setForm] = useState({ judulKarya: "", deskripsi: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoadingMe(false));
  }, []);

  function refetchSubmission() {
    setLoadingSubmission(true);
    return fetch("/api/submissions/me")
      .then((r) => (r.ok ? r.json() : { hasSubmission: false }))
      .then(setMySubmission)
      .catch(() => setMySubmission({ hasSubmission: false }))
      .finally(() => setLoadingSubmission(false));
  }

  useEffect(() => {
    if (me?.participant) refetchSubmission();
    else setLoadingSubmission(false);
  }, [me]);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("File karya wajib diunggah.");
      return;
    }
    if (file.size > MAX_KARYA_BYTES) {
      setError(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal 10MB — kompres dulu ya.`);
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("judulKarya", form.judulKarya);
      fd.append("deskripsi", form.deskripsi);
      fd.append("fileKarya", file);

      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengirim karya");
      }
      await refetchSubmission();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Loading ── */
  if (loadingMe) {
    return (
      <div className="adm-bg min-h-screen flex items-center justify-center p-4">
        <RetroAdminStyles />
        <p className="fb font-extrabold" style={{ color: C.muted }}>Memuat…</p>
      </div>
    );
  }

  /* ── Bukan peserta / belum login ── */
  const participant = me?.participant;
  if (!participant) {
    return (
      <div className="adm-bg min-h-screen flex items-center justify-center p-4">
        <RetroAdminStyles />
        <div className="pop-in adm-card sh-navy max-w-md w-full p-8 text-center">
          <span className="adm-tag" style={{ background: C.yellow }}>Perlu login</span>
          <h1 className="fd text-3xl font-bold mt-4" style={{ color: C.navy }}>
            Login sebagai peserta
          </h1>
          <p className="fb text-sm font-semibold mt-3 mb-6" style={{ color: C.muted }}>
            Halaman ini khusus peserta yang sudah mendaftar lomba. Login pakai email &amp; password yang kamu buat saat pendaftaran.
          </p>
          <a href="/login" className="adm-btn inline-block w-full text-lg py-3" style={{ background: C.lime }}>
            Ke Halaman Login →
          </a>
        </div>
      </div>
    );
  }

  const st = STATUS_CFG[participant.paymentStatus] || STATUS_CFG.PENDING;
  const verified = participant.paymentStatus === "APPROVED";
  const isPaid = participant.isPaidEvent;
  const rejected = participant.paymentStatus === "REJECTED";

  return (
    <div className="adm-bg min-h-screen p-4">
      <RetroAdminStyles />
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        {/* Header + status akun */}
        <div className="pop-in adm-card sh-coral px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="adm-tag" style={{ background: C.coral, color: "#fff" }}>
                IT FEST 6.0 · Peserta
              </span>
              <h1 className="fd text-3xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
                Halo, {participant.nama} 👋
              </h1>
              <p className="fb text-sm font-semibold mt-1" style={{ color: C.muted }}>
                {participant.eventNama}
              </p>
            </div>
            <button onClick={handleLogout} className="adm-btn text-xs px-3 py-2" style={{ background: "#fff" }}>
              Keluar
            </button>
          </div>

          <div
            className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 border-[3px] border-black"
            style={{ background: st.color, color: st.text, boxShadow: "3px 3px 0 #000" }}
          >
            <span className="text-lg">{st.emoji}</span>
            <span className="fb text-sm font-extrabold">
              Status akun: {rejected && !isPaid ? "Pendaftaran Ditolak" : st.tag}
            </span>
          </div>
        </div>

        {/* Gate upload / hasil */}
        {!verified ? (
          <div className="pop-in adm-card sh-navy px-6 py-8 sm:px-8 text-center" style={{ "--d": "100ms" }}>
            <p className="text-4xl mb-3">{st.emoji}</p>
            <h2 className="fd text-2xl font-bold" style={{ color: C.navy }}>
              {rejected
                ? isPaid ? "Pembayaran ditolak" : "Pendaftaran ditolak"
                : "Menunggu verifikasi panitia"}
            </h2>
            <p className="fb text-sm font-semibold mt-3" style={{ color: C.muted }}>
              {rejected
                ? `${isPaid ? "Bukti pembayaran" : "Berkas pendaftaran"} kamu ditolak. Hubungi panitia untuk info lanjutan.`
                : `Upload karya kebuka setelah panitia memverifikasi ${isPaid ? "pembayaran" : "pendaftaran"} kamu. Cek halaman ini lagi nanti.`}
            </p>
          </div>
        ) : loadingSubmission ? (
          <div className="pop-in adm-card sh-navy px-6 py-8 text-center" style={{ "--d": "100ms" }}>
            <p className="fb text-sm font-semibold" style={{ color: C.muted }}>Memuat status karya…</p>
          </div>
        ) : mySubmission?.hasSubmission ? (
          <SubmissionResult data={mySubmission} onRefresh={refetchSubmission} />
        ) : (
          <form onSubmit={handleSubmit} className="pop-in adm-card sh-navy px-6 py-7 sm:px-8 space-y-5" style={{ "--d": "100ms" }}>
            <h2 className="fd text-2xl font-bold" style={{ color: C.navy }}>Upload Karya</h2>

            <div>
              <label className="adm-label fb">Judul Karya</label>
              <input
                className="adm-input" required
                value={form.judulKarya}
                onChange={(e) => setForm((f) => ({ ...f, judulKarya: e.target.value }))}
              />
            </div>

            <div>
              <label className="adm-label fb">Deskripsi Singkat (opsional)</label>
              <textarea
                className="adm-input" rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
              />
            </div>

            <div>
              <label className="adm-label fb">File Karya (PDF/ZIP/DOC, maks. 10MB)</label>
              <input
                type="file" required className="adm-input"
                accept=".pdf,.zip,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && file.size > MAX_KARYA_BYTES && (
                <p className="fb text-[11px] font-black mt-1.5" style={{ color: C.coral }}>
                  {(file.size / 1024 / 1024).toFixed(1)}MB — kelebihan dari batas 10MB.
                </p>
              )}
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
        )}
      </div>
    </div>
  );
}

function SubmissionResult({ data, onRefresh }) {
  const sc = SUBMISSION_CFG[data.status] || SUBMISSION_CFG.SUBMITTED;

  return (
    <div className="pop-in adm-card sh-lime px-6 py-7 sm:px-8 space-y-5" style={{ "--d": "100ms" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="fd text-2xl font-bold" style={{ color: C.navy }}>Karya Kamu</h2>
          <p className="fb text-sm font-semibold mt-1" style={{ color: C.muted }}>
            {data.judulKarya}
          </p>
        </div>
        <button onClick={onRefresh} className="adm-btn text-xs px-3 py-2" style={{ background: "#fff" }}>
          ↻ Cek Ulang
        </button>
      </div>

      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3 border-[3px] border-black"
        style={{ background: sc.color, color: sc.text, boxShadow: "3px 3px 0 #000" }}
      >
        <span className="text-lg">{sc.emoji}</span>
        <span className="fb text-sm font-extrabold">{sc.tag}</span>
      </div>

      {/* Hasil final — cuma tampil kalau kategori udah dipublish panitia */}
      {data.published ? (
        data.isTop5 ? (
          <div
            className="rounded-2xl border-[3px] border-black p-5 text-center"
            style={{ background: C.yellow }}
          >
            <p className="text-3xl mb-1">🏆</p>
            <p className="fd text-xl font-bold" style={{ color: C.navy }}>
              Selamat! Kamu Finalis #{data.rank}
            </p>
            {data.avgScore != null && (
              <p className="fb text-sm font-bold mt-1" style={{ color: C.navy }}>
                Skor akhir: {data.avgScore.toFixed(1)}
              </p>
            )}
          </div>
        ) : data.status === "LOLOS_SELEKSI" ? (
          <div className="rounded-2xl border-[3px] border-black p-5 text-center" style={{ background: "#fff" }}>
            <p className="fb text-sm font-bold" style={{ color: C.navy }}>
              Hasil resmi udah keluar — karya kamu belum masuk 5 besar kali ini.
            </p>
            {data.avgScore != null && (
              <p className="fb text-xs font-semibold mt-1" style={{ color: C.muted }}>
                Skor akhir: {data.avgScore.toFixed(1)}
              </p>
            )}
          </div>
        ) : null
      ) : (
        <p className="fb text-xs font-semibold text-center" style={{ color: C.muted }}>
          Nilai & pengumuman final tampil di sini begitu panitia resmi mengumumkan hasil kategori ini.
        </p>
      )}
    </div>
  );
}
