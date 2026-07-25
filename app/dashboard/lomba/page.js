"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import { ArrowRightOnRectangleIcon, TrophyIcon } from "@heroicons/react/24/outline";

const KATEGORI_LIST = [
  { value: "HACKATHON", label: "Hackathon" },
  { value: "KTI", label: "Karya Tulis Ilmiah" },
  { value: "IOT", label: "Internet of Things" },
];

const STATUS_LABEL = {
  SUBMITTED: "Menunggu Seleksi",
  LOLOS_SELEKSI: "Lolos Seleksi",
  TIDAK_LOLOS: "Tidak Lolos",
};

const TABS = [
  { value: "submissions", label: "Seleksi Karya" },
  { value: "criteria", label: "Kriteria & Bobot" },
  { value: "juri", label: "Akun Juri" },
  { value: "ranking", label: "Ranking & Finalis" },
];

function KategoriPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {KATEGORI_LIST.map((k) => (
        <button
          key={k.value}
          onClick={() => onChange(k.value)}
          className="adm-btn adm-btn-sm"
          style={{ background: value === k.value ? C.coral : "#fff", color: value === k.value ? "#fff" : C.navy }}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}

/* ── Tab: seleksi karya ── */
function SubmissionsTab({ kategori }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/submissions?kategori=${kategori}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [kategori]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setUpdatingId(id);
    try {
      await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="fb font-semibold" style={{ color: C.muted }}>Memuat...</p>;
  if (items.length === 0) return <p className="fb font-semibold" style={{ color: C.muted }}>Belum ada karya masuk buat kategori ini.</p>;

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <div key={s.id} className="adm-card p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="fd font-bold" style={{ color: C.navy }}>{s.judulKarya}</p>
            <p className="fb text-sm font-semibold" style={{ color: C.muted }}>Tim {s.namaTim} — {s.ketuaNama}</p>
            <span className="adm-tag mt-2 inline-flex" style={{
              background: s.status === "LOLOS_SELEKSI" ? C.lime : s.status === "TIDAK_LOLOS" ? C.coral : C.yellow,
              color: s.status === "TIDAK_LOLOS" ? "#fff" : C.navy,
            }}>
              {STATUS_LABEL[s.status]}
            </span>
          </div>
          <div className="flex gap-2">
            <a href={s.fileKaryaUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-sm" style={{ background: "#fff" }}>Lihat</a>
            {s.fileTurnitinUrl && (
              <a href={s.fileTurnitinUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-sm" style={{ background: "#fff" }}>Turnitin</a>
            )}
            {s.linkRepo && (
              <a href={s.linkRepo} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-sm" style={{ background: "#fff" }}>Repo</a>
            )}
            {s.linkVideo && (
              <a href={s.linkVideo} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-sm" style={{ background: "#fff" }}>Video</a>
            )}
            <button
              disabled={updatingId === s.id}
              onClick={() => setStatus(s.id, "LOLOS_SELEKSI")}
              className="adm-btn adm-btn-sm" style={{ background: C.lime }}
            >
              Loloskan
            </button>
            <button
              disabled={updatingId === s.id}
              onClick={() => setStatus(s.id, "TIDAK_LOLOS")}
              className="adm-btn adm-btn-sm" style={{ background: C.coral, color: "#fff" }}
            >
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tab: kriteria & bobot ── */
function CriteriaTab({ kategori }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState("");
  const [bobot, setBobot] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/criteria?kategori=${kategori}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [kategori]);

  useEffect(() => { load(); }, [load]);

  const totalBobot = items.reduce((sum, c) => sum + c.bobot, 0);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!nama || bobot === "") return;
    const res = await fetch("/api/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kategori, nama, bobot: Number(bobot) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal menambah kriteria");
      return;
    }
    setNama(""); setBobot("");
    await load();
  }

  async function handleDelete(id) {
    await fetch(`/api/criteria/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="fb font-semibold" style={{ color: C.muted }}>Memuat...</p>;

  return (
    <div>
      <div className="space-y-3 mb-6">
        {items.map((c) => (
          <div key={c.id} className="adm-card p-4 flex items-center justify-between gap-3">
            <p className="fb font-bold" style={{ color: C.navy }}>{c.nama} <span style={{ color: C.muted }}>— {c.bobot}%</span></p>
            <button onClick={() => handleDelete(c.id)} className="adm-btn adm-btn-sm" style={{ background: C.coral, color: "#fff" }}>Hapus</button>
          </div>
        ))}
        {items.length === 0 && <p className="fb font-semibold" style={{ color: C.muted }}>Belum ada kriteria buat kategori ini.</p>}
      </div>

      <p className="fb text-sm font-extrabold mb-4" style={{ color: totalBobot === 100 ? C.lime : C.coral }}>
        Total bobot: {totalBobot}% {totalBobot !== 100 && "(sebaiknya pas 100%)"}
      </p>

      <form onSubmit={handleAdd} className="adm-card p-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="adm-label fb">Nama Kriteria</label>
          <input className="adm-input" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. Inovasi" />
        </div>
        <div style={{ width: 110 }}>
          <label className="adm-label fb">Bobot (%)</label>
          <input type="number" min={0} max={100} className="adm-input" value={bobot} onChange={(e) => setBobot(e.target.value)} />
        </div>
        <button type="submit" className="adm-btn" style={{ background: C.lime }}>Tambah</button>
      </form>
      {error && <p className="fb text-sm font-extrabold mt-2" style={{ color: C.coral }}>{error}</p>}
    </div>
  );
}

/* ── Tab: akun juri ── */
function JuriTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", nama: "", kategori: "HACKATHON" });
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/juri");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    setInviting(true);
    try {
      const res = await fetch("/api/juri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Gagal mengundang juri");
      }
      setForm({ email: "", nama: "", kategori: "HACKATHON" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Cabut akses juri ini?")) return;
    await fetch(`/api/juri/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="fb font-semibold" style={{ color: C.muted }}>Memuat...</p>;

  return (
    <div>
      <div className="space-y-3 mb-6">
        {items.map((j) => (
          <div key={j.id} className="adm-card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="fb font-bold" style={{ color: C.navy }}>{j.nama}</p>
              <p className="fb text-sm font-semibold" style={{ color: C.muted }}>{j.email} — {KATEGORI_LIST.find((k) => k.value === j.kategori)?.label}</p>
            </div>
            <button onClick={() => handleRemove(j.id)} className="adm-btn adm-btn-sm" style={{ background: C.coral, color: "#fff" }}>Cabut Akses</button>
          </div>
        ))}
        {items.length === 0 && <p className="fb font-semibold" style={{ color: C.muted }}>Belum ada juri diundang.</p>}
      </div>

      <form onSubmit={handleInvite} className="adm-card p-5 space-y-3">
        <p className="fb text-sm font-extrabold" style={{ color: C.navy }}>Undang Juri Baru</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input required type="email" placeholder="Email" className="adm-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input required placeholder="Nama" className="adm-input" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
          <select className="adm-input" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}>
            {KATEGORI_LIST.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={inviting} className="adm-btn" style={{ background: C.lime }}>
          {inviting ? "Mengundang..." : "Kirim Undangan"}
        </button>
        {error && <p className="fb text-sm font-extrabold" style={{ color: C.coral }}>{error}</p>}
        <p className="fb text-xs font-semibold" style={{ color: C.muted }}>
          Juri bakal dapat email undangan Supabase buat set password, lalu login lewat halaman /login yang sama.
        </p>
      </form>
    </div>
  );
}

/* ── Tab: ranking & finalis ── */
function RankingTab({ kategori }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/finalists?kategori=${kategori}`);
    const json = await res.json();
    setData(Array.isArray(json.ranking) ? json : { ranking: [], published: false });
    setLoading(false);
  }, [kategori]);

  useEffect(() => { load(); }, [load]);

  async function togglePublish() {
    setPublishing(true);
    try {
      await fetch(`/api/finalists/${kategori}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !data.published }),
      });
      await load();
    } finally {
      setPublishing(false);
    }
  }

  if (loading || !data) return <p className="fb font-semibold" style={{ color: C.muted }}>Memuat ranking...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="fb text-sm font-semibold" style={{ color: C.muted }}>
          Ranking dihitung otomatis dari rata-rata nilai semua juri.
        </p>
        <button onClick={togglePublish} disabled={publishing} className="adm-btn adm-btn-sm" style={{ background: data.published ? C.coral : C.lime, color: data.published ? "#fff" : C.navy }}>
          {publishing ? "..." : data.published ? "Batalkan Publish" : "Publish Top 5"}
        </button>
      </div>

      <div className="space-y-2">
        {data.ranking.map((r) => (
          <div key={r.id} className="adm-card p-4 flex items-center justify-between gap-3" style={{ boxShadow: r.isTop5 ? `6px 6px 0 ${C.lime}` : undefined }}>
            <div className="flex items-center gap-3">
              <span className="fd text-2xl font-bold" style={{ color: r.isTop5 ? C.coral : C.muted }}>#{r.rank}</span>
              <div>
                <p className="fb font-bold" style={{ color: C.navy }}>{r.namaTim}</p>
                <p className="fb text-sm font-semibold" style={{ color: C.muted }}>{r.judulKarya}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="fd font-bold" style={{ color: C.navy }}>{r.avgScore != null ? r.avgScore.toFixed(1) : "—"}</p>
              <p className="fb text-xs font-semibold" style={{ color: C.muted }}>{r.juriCount} juri menilai</p>
            </div>
          </div>
        ))}
        {data.ranking.length === 0 && <p className="fb font-semibold" style={{ color: C.muted }}>Belum ada submission lolos seleksi buat kategori ini.</p>}
      </div>
    </div>
  );
}

export default function LombaAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("submissions");
  const [kategori, setKategori] = useState("HACKATHON");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="adm-bg min-h-screen">
      <RetroAdminStyles />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="pop-in adm-card sh-coral px-6 py-6 sm:px-8 md:flex md:items-center md:justify-between">
          <div>
            <span className="adm-tag" style={{ background: C.coral, color: "#fff" }}>IT FEST 6.0 · Panitia Lomba</span>
            <h1 className="fd text-4xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
              <TrophyIcon className="inline h-8 w-8 mr-2 -mt-1" /> Alur Penjurian
            </h1>
          </div>
          <div className="mt-5 md:mt-0 flex flex-wrap gap-3">
            <Link href="/dashboard" className="adm-btn" style={{ background: "#fff" }}>Meja Kontrol</Link>
            <button onClick={handleLogout} className="adm-btn" style={{ background: "#fff", color: C.coral }}>
              <ArrowRightOnRectangleIcon className="h-5 w-5" /> Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="adm-btn adm-btn-sm"
              style={{ background: tab === t.value ? C.navy : "#fff", color: tab === t.value ? "#fff" : C.navy }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "juri" && <KategoriPicker value={kategori} onChange={setKategori} />}

        <div className="adm-card p-6">
          {tab === "submissions" && <SubmissionsTab kategori={kategori} />}
          {tab === "criteria" && <CriteriaTab kategori={kategori} />}
          {tab === "juri" && <JuriTab />}
          {tab === "ranking" && <RankingTab kategori={kategori} />}
        </div>
      </div>
    </div>
  );
}
