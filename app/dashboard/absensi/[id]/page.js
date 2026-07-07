"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import Loading from "@/app/loading";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AVATAR_BG = [C.coral, C.blue, C.orange, C.lime, C.navy];

export default function AbsensiEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/events/${id}`);
    setEvent(res.ok ? await res.json() : null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function setHadir(participantId, hadir) {
    setUpdatingId(participantId);
    try {
      await fetch(`/api/participants/${participantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: hadir ? "hadir" : "terdaftar" }),
      });
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  const peserta = event?.participants || [];
  const hadirCount = peserta.filter((p) => p.status === "hadir").length;
  const belumCount = peserta.length - hadirCount;
  const persen = peserta.length ? Math.round((hadirCount / peserta.length) * 100) : 0;

  const filtered = useMemo(() => {
    let list = peserta;
    if (filter === "hadir") list = list.filter((p) => p.status === "hadir");
    if (filter === "belum") list = list.filter((p) => p.status !== "hadir");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (Array.isArray(p.anggota) && p.anggota.some((a) => a.nama.toLowerCase().includes(q))),
      );
    }
    return list;
  }, [peserta, filter, search]);

  if (loading) return <Loading />;

  if (!event) {
    return (
      <div className="adm-bg min-h-screen flex items-center justify-center">
        <RetroAdminStyles />
        <p className="fb font-semibold" style={{ color: C.muted }}>Event tidak ditemukan.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Peserta", value: peserta.length, note: "Terdaftar di event ini", Icon: UsersIcon, sh: "sh-navy", bg: C.navy, rotate: "-0.6deg" },
    { label: "Hadir", value: hadirCount, note: `${persen}% dari total`, Icon: CheckCircleIcon, sh: "sh-lime", bg: C.lime, rotate: "0.8deg" },
    { label: "Belum Hadir", value: belumCount, note: "Menunggu check-in", Icon: ClockIcon, sh: "sh-yellow", bg: C.yellow, rotate: "-0.4deg" },
  ];

  const FILTERS = [
    { value: "all", label: "Semua" },
    { value: "hadir", label: "Hadir" },
    { value: "belum", label: "Belum Hadir" },
  ];

  return (
    <div className="adm-bg min-h-screen">
      <RetroAdminStyles />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="pop-in adm-card sh-blue px-6 py-6 sm:px-8">
          <Link href="/dashboard" className="fb text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1" style={{ color: C.muted }}>
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Meja Kontrol
          </Link>
          <span className="adm-tag mt-3" style={{ background: C.blue, color: "#fff" }}>Absensi Technical Meeting</span>
          <h1 className="fd text-3xl sm:text-4xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
            {event.nama_event}
          </h1>
          <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
            Kalau kelompok, cukup 1 perwakilan yang datang — tandai hadir buat seluruh anggota.
          </p>

          <div className="mt-5">
            <div className="adm-track">
              <div className="adm-fill" style={{ width: `${persen}%`, background: persen === 100 && peserta.length > 0 ? C.lime : C.coral }} />
            </div>
            <p className="fb text-xs font-bold mt-1.5" style={{ color: C.navy }}>{persen}% kehadiran</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className={`pop-in adm-card adm-lift ${s.sh} p-5`}
              style={{ "--d": `${120 + i * 90}ms`, "--r": s.rotate, transform: `rotate(${s.rotate})` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="fb text-[10px] font-extrabold uppercase tracking-[.14em]" style={{ color: C.muted }}>{s.label}</p>
                  <p className="fd text-4xl font-bold mt-1" style={{ color: C.navy }}>{s.value}</p>
                  <p className="fb text-xs font-semibold mt-1" style={{ color: C.muted }}>{s.note}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-[3px] border-black flex-shrink-0" style={{ background: s.bg, boxShadow: "3px 3px 0 #000" }}>
                  <s.Icon className="h-6 w-6" style={{ color: s.bg === C.yellow ? C.navy : "#fff" }} strokeWidth={2.2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + search */}
        <div className="pop-in adm-card sh-yellow p-5 mb-6" style={{ "--d": "380ms" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: C.muted }} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Cari nama peserta / tim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="adm-input"
                style={{ paddingLeft: "2.6rem" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="adm-btn adm-btn-sm"
                  style={{ background: filter === f.value ? C.navy : "#fff", color: filter === f.value ? "#fff" : C.navy }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="fb mt-3 text-xs font-bold" style={{ color: C.muted }}>
            Menampilkan {filtered.length} dari {peserta.length} peserta
          </p>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="adm-card p-10 text-center">
            <UsersIcon className="mx-auto h-12 w-12" style={{ color: C.muted }} />
            <p className="fb mt-3 text-sm font-semibold" style={{ color: C.muted }}>
              {peserta.length === 0 ? "Belum ada peserta terdaftar buat event ini." : "Gak ada yang cocok sama pencarian."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((p, i) => {
              const isTim = p.jenisPeserta === "kelompok" && Array.isArray(p.anggota) && p.anggota.length > 1;
              const isHadir = p.status === "hadir";
              return (
                <div
                  key={p.id}
                  className="pop-in adm-card adm-lift p-4 flex flex-wrap items-center justify-between gap-4"
                  style={{ "--d": `${i * 40}ms`, boxShadow: isHadir ? `5px 5px 0 ${C.lime}` : "6px 6px 0 #000" }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="fd flex-shrink-0 h-11 w-11 rounded-full border-[2.5px] border-black flex items-center justify-center font-semibold text-white"
                      style={{ background: AVATAR_BG[i % AVATAR_BG.length], boxShadow: "2px 2px 0 #000" }}
                    >
                      {p.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="fb font-extrabold" style={{ color: C.navy }}>{p.nama}</p>
                        {isTim && (
                          <span className="adm-tag" style={{ background: C.blue, color: "#fff" }}>Tim · {p.anggota.length} orang</span>
                        )}
                      </div>
                      <p className="fb text-xs font-semibold" style={{ color: C.muted }}>
                        {p.email}{p.no_wa ? ` · ${p.no_wa}` : ""}
                      </p>
                      {isTim && (
                        <ul className="mt-1.5">
                          {p.anggota.map((a, j) => (
                            <li key={j} className="fb text-[11px] font-semibold" style={{ color: C.muted }}>
                              {j === 0 ? "Ketua" : `Anggota ${j}`} — {a.nama}{a.nim ? ` (${a.nim})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setHadir(p.id, !isHadir)}
                    disabled={updatingId === p.id}
                    className="adm-btn adm-btn-sm flex-shrink-0"
                    style={{ background: isHadir ? C.lime : "#fff" }}
                  >
                    {updatingId === p.id ? "..." : isHadir ? (
                      <><CheckCircleIcon className="h-4 w-4" /> Hadir</>
                    ) : "Tandai Hadir"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
