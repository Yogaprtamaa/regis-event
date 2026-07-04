"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import { ArrowRightOnRectangleIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { computeWeightedTotal } from "@/lib/scoring";

const KATEGORI_LABEL = {
  HACKATHON: "Hackathon",
  KTI: "Karya Tulis Ilmiah",
  IOT: "Internet of Things",
  GAME_MAKING: "Game Making",
};

function ScoreForm({ submission, criteria, onSaved }) {
  const [items, setItems] = useState({});
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/scores?submissionId=${submission.id}`)
      .then((r) => r.json())
      .then((score) => {
        if (score) {
          const map = {};
          score.items.forEach((it) => { map[it.criteriaId] = it.nilai; });
          setItems(map);
          setCatatan(score.catatan || "");
          setSaved(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [submission.id]);

  const preview = computeWeightedTotal(
    criteria.map((c) => ({ criteriaId: c.id, nilai: Number(items[c.id]) || 0 })),
    criteria,
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        submissionId: submission.id,
        catatan,
        items: criteria.map((c) => ({ criteriaId: c.id, nilai: Number(items[c.id]) || 0 })),
      };
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan nilai");
      }
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="fb text-sm font-semibold" style={{ color: C.muted }}>Memuat nilai...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {criteria.length === 0 && (
        <p className="fb text-sm font-semibold" style={{ color: C.coral }}>
          Panitia belum bikin kriteria penilaian buat kategori ini.
        </p>
      )}
      {criteria.map((c) => (
        <div key={c.id} className="flex items-center gap-3">
          <label className="fb text-sm font-bold flex-1" style={{ color: C.navy }}>
            {c.nama} <span className="fb font-semibold" style={{ color: C.muted }}>({c.bobot}%)</span>
          </label>
          <input
            type="number" min={0} max={100} step={1} required
            className="adm-input" style={{ width: 90 }}
            value={items[c.id] ?? ""}
            onChange={(e) => setItems((it) => ({ ...it, [c.id]: e.target.value }))}
          />
        </div>
      ))}

      {criteria.length > 0 && (
        <div className="adm-track">
          <div className="adm-fill" style={{ width: `${Math.min(preview, 100)}%`, background: C.lime }} />
        </div>
      )}
      <p className="fb text-sm font-bold" style={{ color: C.navy }}>
        Total sementara: {preview.toFixed(1)} / 100
      </p>

      <textarea
        className="adm-input" rows={2}
        placeholder="Catatan buat tim ini (opsional)"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
      />

      {error && <p className="fb text-sm font-extrabold" style={{ color: C.coral }}>{error}</p>}

      <button
        type="submit" disabled={saving || criteria.length === 0}
        className="adm-btn adm-btn-sm"
        style={{ background: saved ? C.lime : C.coral, color: saved ? C.navy : "#fff" }}
      >
        {saving ? "Menyimpan..." : saved ? "Update Nilai" : "Simpan Nilai"}
      </button>
    </form>
  );
}

function SubmissionCard({ submission, criteria, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pop-in adm-card adm-lift sh-blue p-6" style={{ "--d": `${index * 80}ms` }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="fd text-xl font-bold" style={{ color: C.navy }}>{submission.judulKarya}</h3>
          <p className="fb text-sm font-semibold mt-1" style={{ color: C.muted }}>
            Tim {submission.namaTim} — {submission.ketuaNama}
          </p>
        </div>
        <a
          href={submission.fileKaryaUrl} target="_blank" rel="noopener noreferrer"
          className="adm-btn adm-btn-sm"
          style={{ background: "#fff" }}
        >
          <DocumentArrowDownIcon className="h-4 w-4" /> Lihat Karya
        </a>
      </div>

      {submission.deskripsi && (
        <p className="fb text-sm font-medium mt-3" style={{ color: C.navy }}>{submission.deskripsi}</p>
      )}

      <button onClick={() => setOpen((o) => !o)} className="adm-btn adm-btn-sm mt-4" style={{ background: C.yellow }}>
        {open ? "Tutup Form Nilai" : "Nilai Karya Ini"}
      </button>

      {open && <ScoreForm submission={submission} criteria={criteria} onSaved={() => {}} />}
    </div>
  );
}

export default function JuriDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (kategori) => {
    const [subsRes, critRes] = await Promise.all([
      fetch(`/api/submissions?kategori=${kategori}`),
      fetch(`/api/criteria?kategori=${kategori}`),
    ]);
    setSubmissions(await subsRes.json());
    setCriteria(await critRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "JURI") {
          router.replace("/dashboard");
          return;
        }
        setMe(data);
        fetchData(data.kategori);
      });
  }, [router, fetchData]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!me || loading) {
    return (
      <div className="adm-bg min-h-screen flex items-center justify-center">
        <RetroAdminStyles />
        <p className="fb font-semibold" style={{ color: C.navy }}>Memuat dashboard juri...</p>
      </div>
    );
  }

  return (
    <div className="adm-bg min-h-screen">
      <RetroAdminStyles />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="pop-in adm-card sh-navy px-6 py-6 sm:px-8 md:flex md:items-center md:justify-between">
          <div>
            <span className="adm-tag" style={{ background: C.yellow }}>Juri · {KATEGORI_LABEL[me.kategori]}</span>
            <h1 className="fd text-4xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
              Halo, {me.nama || "Juri"}
            </h1>
            <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
              {submissions.length} karya lolos seleksi menunggu penilaian Anda.
            </p>
          </div>
          <button onClick={handleLogout} className="adm-btn mt-5 md:mt-0" style={{ background: "#fff", color: C.coral }}>
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Keluar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {submissions.length === 0 ? (
          <div className="adm-card p-8 text-center">
            <p className="fb font-semibold" style={{ color: C.muted }}>
              Belum ada karya yang lolos seleksi panitia buat kategori ini.
            </p>
          </div>
        ) : (
          submissions.map((s, i) => (
            <SubmissionCard key={s.id} submission={s} criteria={criteria} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
