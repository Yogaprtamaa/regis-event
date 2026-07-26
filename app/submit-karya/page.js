"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import { kategoriFromEventName, karyaRequirements, MAX_KARYA_BYTES } from "@/lib/kategori";
import { formatTanggalPengumuman } from "@/lib/scoring";

const STATUS_CFG = {
  APPROVED: { tag: "Terverifikasi", color: C.lime, text: C.navy, emoji: "✅" },
  PENDING: { tag: "Menunggu Verifikasi", color: C.yellow, text: C.navy, emoji: "⏳" },
  FREE: { tag: "Menunggu Verifikasi", color: C.yellow, text: C.navy, emoji: "⏳" },
  REJECTED: { tag: "Pembayaran Ditolak", color: C.coral, text: "#fff", emoji: "⛔" },
};

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

  const [form, setForm] = useState({ judulKarya: "", deskripsi: "", linkKarya: "", linkRepo: "", linkVideo: "" });
  const [file, setFile] = useState(null);
  const [turnitinFile, setTurnitinFile] = useState(null);
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
    const pakaiDrive = req.fileKarya === "drive";

    if (pakaiDrive) {
      if (!/^https?:\/\/\S+$/i.test(form.linkKarya.trim())) {
        setError("Link karya wajib diisi dan diawali http:// atau https://");
        return;
      }
    } else {
      if (!file) {
        setError("File karya wajib diunggah.");
        return;
      }
      if (file.type !== "application/pdf") {
        setError("File karya harus PDF.");
        return;
      }
      if (file.size > MAX_KARYA_BYTES) {
        setError(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal ${MAX_KARYA_BYTES / 1024 / 1024}MB — kompres dulu ya.`);
        return;
      }
    }
    if (needTurnitin && !turnitinFile) {
      setError("Laporan Turnitin wajib diunggah.");
      return;
    }
    if (turnitinFile && (turnitinFile.type !== "application/pdf" || turnitinFile.size > MAX_KARYA_BYTES)) {
      setError(`Laporan Turnitin harus PDF, maksimal ${MAX_KARYA_BYTES / 1024 / 1024}MB.`);
      return;
    }
    setLoading(true);
    try {
      // File diupload langsung ke Supabase pakai signed URL — lewat API route
      // kena batas ukuran body Vercel.
      const uploadPdf = async (f, kind) => {
        const urlRes = await fetch("/api/submissions/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: f.name, kind }),
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlData.error || "Gagal menyiapkan upload");

        const { error: uploadError } = await createClient()
          .storage.from("karya-submissions")
          .uploadToSignedUrl(urlData.path, urlData.token, f, { contentType: "application/pdf" });
        if (uploadError) throw new Error(`Gagal mengunggah file: ${uploadError.message}`);
        return urlData.publicUrl;
      };

      const fileKaryaUrl = pakaiDrive ? form.linkKarya.trim() : await uploadPdf(file, "karya");
      const fileTurnitinUrl = turnitinFile ? await uploadPdf(turnitinFile, "turnitin") : null;

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judulKarya: form.judulKarya,
          deskripsi: form.deskripsi,
          fileKaryaUrl,
          fileTurnitinUrl,
          linkRepo: form.linkRepo.trim() || null,
          linkVideo: form.linkVideo.trim() || null,
        }),
      });
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
  // Berkas yang diminta beda-beda per kategori lomba
  const req = karyaRequirements(kategoriFromEventName(participant.eventNama));
  const needTurnitin = req.fileTurnitin === "required";

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
                Halo, {participant.namaTim || participant.nama} 👋
              </h1>
              <p className="fb text-sm font-semibold mt-1" style={{ color: C.muted }}>
                {participant.eventNama}
                {participant.namaTim && ` · Ketua: ${participant.nama}`}
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

          {/* Lampiran panitia — sengaja baru muncul setelah akun diverifikasi */}
          {verified && (participant.waGroupLink || participant.panduanUrl) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {participant.waGroupLink && (
                <a
                  href={participant.waGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-sm text-xs px-4 py-2.5"
                  style={{ background: "#25D366", color: "#fff" }}
                >
                  💬 Gabung Grup WhatsApp
                </a>
              )}
              {participant.panduanUrl && (
                <a
                  href={participant.panduanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-sm text-xs px-4 py-2.5"
                  style={{ background: "#fff" }}
                >
                  📘 Buku Panduan
                </a>
              )}
            </div>
          )}
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
              <label className="adm-label fb">{req.fileLabel}</label>
              {req.fileKarya === "drive" ? (
                <>
                  <input
                    type="url" required className="adm-input"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={form.linkKarya}
                    onChange={(e) => setForm((f) => ({ ...f, linkKarya: e.target.value }))}
                  />
                  <p className="fb text-[11px] font-semibold mt-1.5" style={{ color: C.muted }}>
                    {req.fileHelp} Set akses “siapa saja yang punya link” dan jangan diubah sampai
                    penjurian selesai.
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="file" required className="adm-input"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="fb text-[11px] font-semibold mt-1.5" style={{ color: C.muted }}>{req.fileHelp}</p>
                  {file && file.size > MAX_KARYA_BYTES && (
                    <p className="fb text-[11px] font-black mt-1.5" style={{ color: C.coral }}>
                      {(file.size / 1024 / 1024).toFixed(1)}MB — kelebihan dari batas {MAX_KARYA_BYTES / 1024 / 1024}MB.
                    </p>
                  )}
                </>
              )}
            </div>

            {needTurnitin && (
              <div>
                <label className="adm-label fb">Laporan Turnitin (PDF)</label>
                <input
                  type="file" required className="adm-input"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setTurnitinFile(e.target.files?.[0] ?? null)}
                />
                <p className="fb text-[11px] font-semibold mt-1.5" style={{ color: C.muted }}>
                  Hasil cek plagiarisme, similarity maksimal 30%. PDF maksimal {MAX_KARYA_BYTES / 1024 / 1024}MB.
                </p>
                {turnitinFile && turnitinFile.size > MAX_KARYA_BYTES && (
                  <p className="fb text-[11px] font-black mt-1.5" style={{ color: C.coral }}>
                    {(turnitinFile.size / 1024 / 1024).toFixed(1)}MB — kelebihan dari batas {MAX_KARYA_BYTES / 1024 / 1024}MB.
                  </p>
                )}
              </div>
            )}

            {req.linkRepo !== "off" && (
              <div>
                <label className="adm-label fb">Link Repository{req.linkRepo === "optional" && " (opsional)"}</label>
                <input
                  type="url" className="adm-input"
                  required={req.linkRepo === "required"}
                  placeholder="https://github.com/tim/proyek"
                  value={form.linkRepo}
                  onChange={(e) => setForm((f) => ({ ...f, linkRepo: e.target.value }))}
                />
                <p className="fb text-[11px] font-semibold mt-1.5" style={{ color: C.muted }}>
                  Pastikan repo bisa diakses publik saat penjurian.
                </p>
              </div>
            )}

            {req.linkVideo !== "off" && (
              <div>
                <label className="adm-label fb">Link Video Demo{req.linkVideo === "optional" && " (opsional)"}</label>
                <input
                  type="url" className="adm-input"
                  required={req.linkVideo === "required"}
                  placeholder="https://drive.google.com/... atau YouTube"
                  value={form.linkVideo}
                  onChange={(e) => setForm((f) => ({ ...f, linkVideo: e.target.value }))}
                />
                <p className="fb text-[11px] font-semibold mt-1.5" style={{ color: C.muted }}>
                  Video diunggah ke Google Drive / YouTube, di sini cukup linknya. Set akses “siapa saja yang punya link”.
                </p>
              </div>
            )}

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

      <div className="flex flex-wrap gap-2">
        {[
          { label: "📄 Berkas", href: data.fileKaryaUrl },
          { label: "🔍 Turnitin", href: data.fileTurnitinUrl },
          { label: "💻 Repository", href: data.linkRepo },
          { label: "🎬 Video Demo", href: data.linkVideo },
        ]
          .filter((l) => l.href)
          .map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="adm-btn adm-btn-sm text-xs px-3 py-2" style={{ background: "#fff" }}>
              {l.label}
            </a>
          ))}
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
            {data.totalScore != null && (
              <p className="fb text-sm font-bold mt-1" style={{ color: C.navy }}>
                Skor akhir: {data.totalScore.toFixed(1)} / 300
              </p>
            )}
          </div>
        ) : data.status === "LOLOS_SELEKSI" ? (
          <div className="rounded-2xl border-[3px] border-black p-5 text-center" style={{ background: "#fff" }}>
            <p className="fb text-sm font-bold" style={{ color: C.navy }}>
              Hasil resmi udah keluar — karya kamu belum masuk 5 besar kali ini.
            </p>
            {data.totalScore != null && (
              <p className="fb text-xs font-semibold mt-1" style={{ color: C.muted }}>
                Skor akhir: {data.totalScore.toFixed(1)} / 300
              </p>
            )}
          </div>
        ) : null
      ) : data.status === "TIDAK_LOLOS" ? null : (
        <div className="rounded-2xl border-[3px] border-black p-5 text-center" style={{ background: C.sand }}>
          <p className="text-2xl mb-1">🎉</p>
          <p className="fb text-sm font-bold" style={{ color: C.navy }}>
            Selamat, karya kamu sudah terkirim dan akan dinilai oleh juri.
          </p>
          <p className="fb text-xs font-semibold mt-1.5" style={{ color: C.muted, lineHeight: 1.7 }}>
            {data.announceAt
              ? <>Pengumuman akan diinfokan melalui website ini pada tanggal <strong style={{ color: C.navy }}>{formatTanggalPengumuman(data.announceAt)}</strong>.</>
              : "Pengumuman akan diinfokan melalui website ini. Pantau terus halaman ini ya!"}
          </p>
        </div>
      )}
    </div>
  );
}
