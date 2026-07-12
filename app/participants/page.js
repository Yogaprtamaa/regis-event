"use client";
import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  UsersIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import Loading from "@/app/loading";

const ROLE_LABEL = {
  DOSEN: "Dosen",
  PANITIA: "Panitia",
  MAHASISWA: "Mahasiswa",
  PENGURUS_HIMTI: "Pengurus HIMTI",
};

const ROLE_BG = {
  DOSEN: C.blue,
  PANITIA: C.yellow,
  MAHASISWA: C.orange,
  PENGURUS_HIMTI: C.coral,
};

const PAYMENT_CFG = {
  APPROVED: { bg: C.lime, text: C.navy, label: "Terverifikasi" },
  PENDING: { bg: C.yellow, text: C.navy, label: "Menunggu" },
  REJECTED: { bg: C.coral, text: "#fff", label: "Ditolak" },
  FREE: { bg: C.blue, text: "#fff", label: "Free" },
};

function paymentCfg(status) {
  return PAYMENT_CFG[status || "FREE"] || PAYMENT_CFG.FREE;
}

/* ── Toast (pengganti alert()) ── */
function Toast({ toast, onClose }) {
  const timerRef = useRef(null);
  useEffect(() => {
    if (!toast) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onClose, 3200);
    return () => clearTimeout(timerRef.current);
  }, [toast, onClose]);

  if (!toast) return null;
  const bg = toast.tone === "error" ? C.coral : toast.tone === "info" ? C.blue : C.lime;
  const text = toast.tone === "success" ? C.navy : "#fff";
  return (
    <div
      className="stamp-in fixed bottom-6 right-6 z-[70] adm-card px-5 py-3.5 max-w-sm"
      style={{ background: bg, boxShadow: "5px 5px 0 #000", "--d": "0ms" }}
      role="status"
    >
      <p className="fb text-sm font-extrabold" style={{ color: text }}>
        {toast.message}
      </p>
    </div>
  );
}

/* ── Modal konfirmasi generik (approve / reject / reset / hapus) ── */
function ConfirmModal({ action, reason, onReasonChange, onCancel, onConfirm, busy }) {
  if (!action) return null;
  const CFG = {
    approve: {
      title: "Setujui peserta ini?",
      body: "Peserta akan bisa login & upload karya lomba setelah disetujui.",
      confirmLabel: "Ya, Setujui",
      color: C.lime,
      confirmText: C.navy,
    },
    reject: {
      title: "Tolak peserta ini?",
      body: "Upload karya peserta akan terkunci. Kasih alasan biar peserta paham (opsional, tapi disarankan).",
      confirmLabel: "Ya, Tolak",
      color: C.coral,
      confirmText: "#fff",
    },
    reset: {
      title: "Reset ke status Menunggu?",
      body: "Peserta akan masuk lagi ke antrian verifikasi. Kalau sebelumnya disetujui, upload karya bakal terkunci lagi.",
      confirmLabel: "Ya, Reset",
      color: C.yellow,
      confirmText: C.navy,
    },
    delete: {
      title: "Hapus peserta ini?",
      body: "Data pendaftaran & seluruh berkasnya bakal hilang permanen. Gak bisa dibatalkan.",
      confirmLabel: "Ya, Hapus",
      color: C.coral,
      confirmText: "#fff",
    },
  }[action.type];

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="stamp-in adm-card sh-navy max-w-sm w-full overflow-hidden" style={{ "--d": "0ms" }}>
        <div className="px-6 py-5">
          <h3 className="fd text-xl font-bold" style={{ color: C.navy }}>
            {CFG.title}
          </h3>
          <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
            {action.participant?.nama}
          </p>
          <p className="fb text-sm font-medium mt-3" style={{ color: C.muted }}>
            {CFG.body}
          </p>

          {action.type === "reject" && (
            <textarea
              className="adm-input mt-3"
              rows={3}
              placeholder="Contoh: Foto KTM buram, tolong upload ulang."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} className="adm-btn flex-1" disabled={busy}>
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="adm-btn flex-1"
            style={{ background: CFG.color, color: CFG.confirmText }}
          >
            {busy ? "..." : CFG.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal review bukti (bayar + follow IG + KTM) ── */
function ReviewModal({ participant, onClose, onAction }) {
  if (!participant) return null;
  const fotoKtm = Array.isArray(participant.fotoKtm) ? participant.fotoKtm : [];
  const st = paymentCfg(participant.paymentStatus);

  const Evidence = ({ label, url }) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt={label}
          className="rounded-xl border-[3px] border-black w-full h-40 object-cover"
          style={{ boxShadow: "3px 3px 0 #000" }}
        />
        <p className="fb text-[11px] font-extrabold mt-1.5" style={{ color: C.navy }}>
          {label}
        </p>
      </a>
    ) : (
      <div
        className="rounded-xl border-[3px] border-dashed flex items-center justify-center h-40"
        style={{ borderColor: "rgba(8,46,75,.3)" }}
      >
        <p className="fb text-xs font-bold" style={{ color: C.muted }}>
          {label} — tidak ada
        </p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-4">
      <div className="stamp-in adm-card sh-blue max-w-2xl w-full overflow-hidden my-8" style={{ "--d": "0ms" }}>
        <div
          className="px-6 py-4 flex justify-between items-start gap-3"
          style={{ background: C.blue, borderBottom: "3px solid #000" }}
        >
          <div>
            <h2 className="fd text-xl font-bold text-white">Review Berkas</h2>
            <p className="fb text-xs font-semibold text-white/80 mt-0.5">
              {participant.jenisPeserta === "kelompok" ? `Tim ${participant.nama}` : participant.nama} · {participant.event?.nama_event}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="fd w-9 h-9 flex-shrink-0 rounded-full border-[2.5px] border-black bg-white text-xl leading-none hover:rotate-90 transition-transform"
            style={{ boxShadow: "2px 2px 0 #000", color: C.navy }}
          >
            ×
          </button>
        </div>

        <div className="p-6" style={{ background: C.sand }}>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="fb px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
              style={{ background: st.bg, color: st.text }}
            >
              {st.label}
            </span>
            {participant.setujuSyaratKti && (
              <span
                className="fb inline-flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                style={{ background: "#fff", color: C.navy }}
              >
                <ShieldCheckIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> Setuju Syarat KTI
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Evidence label="Bukti Pembayaran" url={participant.buktiPembayaran} />
            <Evidence label="Bukti Follow IG" url={participant.buktiFollow} />
            {fotoKtm.length > 0 ? (
              fotoKtm.map((url, i) => (
                <Evidence key={url} label={`Foto KTM ${fotoKtm.length > 1 ? i + 1 : ""}`} url={url} />
              ))
            ) : (
              <Evidence label="Foto KTM" url={null} />
            )}
          </div>

          {participant.catatanVerifikasi && (
            <div
              className="mt-5 rounded-xl border-[3px] border-black p-4"
              style={{ background: "#fff" }}
            >
              <p className="fb text-[10px] font-extrabold uppercase tracking-widest" style={{ color: C.coral }}>
                Catatan Verifikasi
              </p>
              <p className="fb text-sm font-semibold mt-1" style={{ color: C.navy }}>
                {participant.catatanVerifikasi}
              </p>
            </div>
          )}

          <div className="flex gap-2.5 flex-wrap mt-6">
            {participant.paymentStatus !== "APPROVED" && (
              <button
                onClick={() => onAction("approve", participant)}
                className="adm-btn"
                style={{ background: C.lime }}
              >
                <CheckIcon className="w-4 h-4" strokeWidth={2.5} /> Setujui
              </button>
            )}
            {participant.paymentStatus !== "REJECTED" && (
              <button
                onClick={() => onAction("reject", participant)}
                className="adm-btn"
                style={{ background: C.coral, color: "#fff" }}
              >
                Tolak
              </button>
            )}
            {(participant.paymentStatus === "APPROVED" || participant.paymentStatus === "REJECTED") && (
              <button onClick={() => onAction("reset", participant)} className="adm-btn" style={{ background: "#fff" }}>
                ↺ Reset ke Menunggu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Baris detail (expandable) ── */
function DetailRow({ participant }) {
  const fields = [
    ["NIM", participant.nim],
    ["Jurusan / Prodi", participant.jurusan],
    ["Angkatan", participant.angkatan],
    ["Divisi", participant.divisi],
    ["Instansi", participant.instansi],
    ["No. WhatsApp", participant.no_wa],
    ["Universitas", participant.universitas],
    ["Fakultas", participant.fakultas],
    ["Kota Domisili", participant.kotaDomisili],
    ["Provinsi", participant.provinsi],
    ["Jenis Peserta", participant.jenisPeserta === "kelompok" ? "Kelompok" : participant.jenisPeserta === "individu" ? "Individu" : null],
    ["Terdaftar", participant.createdAt ? new Date(participant.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : null],
  ].filter(([, v]) => v);

  return (
    <tr style={{ background: "#FDF5E4" }}>
      <td colSpan={5} className="px-5 py-4" style={{ borderTop: "2px dashed rgba(8,46,75,.2)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          {fields.map(([label, val]) => (
            <div key={label}>
              <p className="fb text-[10px] font-extrabold uppercase tracking-widest" style={{ color: C.muted }}>
                {label}
              </p>
              <p className="fb text-sm font-bold mt-0.5" style={{ color: C.navy }}>
                {val}
              </p>
            </div>
          ))}
          {Array.isArray(participant.anggota) && participant.anggota.length > 0 && (
            <div className="col-span-full">
              <p className="fb text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: C.muted }}>
                Anggota
              </p>
              <ul className="space-y-0.5">
                {participant.anggota.map((a, i) => (
                  <li key={i} className="fb text-sm font-bold" style={{ color: C.navy }}>
                    {i === 0 ? "Ketua" : `Anggota ${i}`} — {a.nama}{a.nim ? ` (${a.nim})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("verifikasi"); // "verifikasi" | "semua"
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  function notify(message, tone = "success") {
    setToast({ message, tone });
  }

  async function fetchData() {
    try {
      setLoading(true);
      const participantsRes = await fetch("/api/participants");
      if (!participantsRes.ok) throw new Error(`Participants API error: ${participantsRes.status}`);
      const participantsData = await participantsRes.json();
      if (!Array.isArray(participantsData)) throw new Error("Participants data is not an array");

      const eventsRes = await fetch("/api/events");
      if (!eventsRes.ok) throw new Error(`Events API error: ${eventsRes.status}`);
      const eventsData = await eventsRes.json();
      if (!Array.isArray(eventsData)) throw new Error("Events data is not an array");

      setParticipants(participantsData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setParticipants([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(
    () => ({
      total: participants.length,
      pending: participants.filter((p) => (p.paymentStatus || "FREE") === "PENDING").length,
      approved: participants.filter((p) => p.paymentStatus === "APPROVED").length,
      hadir: participants.filter((p) => p.status === "hadir").length,
    }),
    [participants],
  );

  const filtered = useMemo(() => {
    let list = participants;

    if (tab === "verifikasi") {
      list = list.filter((p) => (p.paymentStatus || "FREE") === "PENDING");
    } else {
      if (paymentFilter !== "all") list = list.filter((p) => (p.paymentStatus || "FREE") === paymentFilter);
      if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    }

    if (eventFilter !== "all") list = list.filter((p) => p.eventId === eventFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.nim || "").includes(search) ||
          (p.jurusan || "").toLowerCase().includes(q) ||
          (p.divisi || "").toLowerCase().includes(q) ||
          (p.instansi || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [participants, tab, search, statusFilter, eventFilter, paymentFilter]);

  async function updateParticipant(participantId, body) {
    setUpdatingId(participantId);
    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Gagal update");
      }
      const updated = await response.json();
      setParticipants((prev) => prev.map((p) => (p.id === participantId ? updated : p)));
      return updated;
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateParticipantStatus(participantId, newStatus) {
    try {
      await updateParticipant(participantId, { status: newStatus });
    } catch (error) {
      notify("Gagal update kehadiran: " + error.message, "error");
    }
  }

  function requestAction(type, participant) {
    setReason("");
    setConfirmAction({ type, participant });
  }

  async function confirmActionRun() {
    const { type, participant } = confirmAction;
    try {
      if (type === "delete") {
        setUpdatingId(participant.id);
        const res = await fetch(`/api/participants/${participant.id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus peserta");
        }
        setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
        notify("Peserta dihapus.");
      } else {
        const paymentStatus = type === "approve" ? "APPROVED" : type === "reject" ? "REJECTED" : "PENDING";
        const body = { paymentStatus };
        if (type === "reject") body.catatanVerifikasi = reason;
        if (type === "approve" || type === "reset") body.catatanVerifikasi = "";
        await updateParticipant(participant.id, body);
        notify(
          type === "approve"
            ? "Peserta disetujui — upload karya udah kebuka."
            : type === "reject"
              ? "Peserta ditolak."
              : "Direset ke Menunggu.",
        );
        setReviewing(null);
      }
      setConfirmAction(null);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setUpdatingId(null);
    }
  }

  const statusBg = (status) => {
    switch ((status || "").toLowerCase()) {
      case "hadir":
        return C.lime;
      case "terdaftar":
        return C.yellow;
      case "batal":
        return C.coral;
      default:
        return "#e2e8f0";
    }
  };

  if (loading) return <Loading />;

  const statCards = [
    { label: "Total Peserta", value: counts.total, Icon: UsersIcon, sh: "sh-navy", bg: C.navy, rotate: "-0.8deg" },
    { label: "Perlu Verifikasi", value: counts.pending, Icon: ClockIcon, sh: "sh-coral", bg: C.coral, rotate: "0.6deg", highlight: true },
    { label: "Terverifikasi", value: counts.approved, Icon: ShieldCheckIcon, sh: "sh-lime", bg: C.lime, rotate: "-0.5deg" },
    { label: "Hadir", value: counts.hadir, Icon: CheckIcon, sh: "sh-blue", bg: C.blue, rotate: "0.7deg" },
  ];

  return (
    <div className="adm-bg">
      <RetroAdminStyles />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        action={confirmAction}
        reason={reason}
        onReasonChange={setReason}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmActionRun}
        busy={updatingId === confirmAction?.participant?.id}
      />
      <ReviewModal
        participant={reviewing}
        onClose={() => setReviewing(null)}
        onAction={(type, participant) => requestAction(type, participant)}
      />

      {/* Header */}
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="pop-in adm-card sh-navy px-6 py-6 sm:px-8">
          <span className="adm-tag" style={{ background: C.coral, color: "#fff" }}>
            Guest List
          </span>
          <h1 className="fd text-4xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
            Manajemen Peserta
          </h1>
          <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
            Verifikasi berkas, kelola kehadiran, dan data semua peserta.
          </p>
        </div>
      </div>

      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <button
              key={s.label}
              onClick={() => s.label === "Perlu Verifikasi" && setTab("verifikasi")}
              className={`pop-in adm-card adm-lift ${s.sh} p-6 text-left ${s.highlight ? "ring-4 ring-black/5" : ""}`}
              style={{ "--d": `${100 + i * 90}ms`, "--r": s.rotate, transform: `rotate(${s.rotate})` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="fb text-[11px] font-extrabold uppercase tracking-[.14em]" style={{ color: C.muted }}>
                    {s.label}
                  </p>
                  <p className="fd text-5xl font-bold mt-1" style={{ color: C.navy }}>
                    {s.value}
                  </p>
                </div>
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl border-[3px] border-black"
                  style={{ background: s.bg, boxShadow: "3px 3px 0 #000" }}
                >
                  <s.Icon className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="pop-in flex gap-2 mb-5" style={{ "--d": "220ms" }}>
          {[
            { key: "verifikasi", label: `Antrian Verifikasi (${counts.pending})` },
            { key: "semua", label: "Semua Peserta" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="fb px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-2xl border-[3px] border-black transition"
              style={{
                background: tab === t.key ? C.navy : "#fff",
                color: tab === t.key ? "#fff" : C.navy,
                boxShadow: tab === t.key ? "3px 3px 0 #000" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="pop-in adm-card sh-yellow p-5 sm:p-6 mb-8" style={{ "--d": "280ms" }}>
          <div className={`grid grid-cols-1 ${tab === "semua" ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: C.muted }} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Cari nama, email, NIM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="adm-input"
                style={{ paddingLeft: "2.6rem" }}
              />
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10" style={{ color: C.muted }} strokeWidth={2.5} />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="adm-input"
                style={{ paddingLeft: "2.6rem", appearance: "none" }}
              >
                <option value="all">Semua Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nama_event}
                  </option>
                ))}
              </select>
            </div>

            {tab === "semua" && (
              <>
                <div className="relative">
                  <FunnelIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10" style={{ color: C.muted }} strokeWidth={2.5} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="adm-input"
                    style={{ paddingLeft: "2.6rem", appearance: "none" }}
                  >
                    <option value="all">Semua Kehadiran</option>
                    <option value="terdaftar">Terdaftar</option>
                    <option value="hadir">Hadir</option>
                    <option value="batal">Batal</option>
                  </select>
                </div>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="adm-input"
                  style={{ appearance: "none" }}
                >
                  <option value="all">Semua Verifikasi</option>
                  <option value="FREE">Free</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="APPROVED">Terverifikasi</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </>
            )}
          </div>

          <p className="fb mt-4 text-sm font-bold" style={{ color: C.navy }}>
            Menampilkan {filtered.length} peserta
          </p>
        </div>

        {/* Table */}
        <div className="pop-in adm-card sh-navy overflow-hidden" style={{ "--d": "380ms" }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: C.navy }}>
                  {["Peserta", "Event", "Kehadiran", "Verifikasi", "Aksi"].map((h) => (
                    <th key={h} className="fb px-5 py-4 text-left text-[10px] font-extrabold text-white uppercase tracking-[.14em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <UsersIcon className="mx-auto h-12 w-12" style={{ color: C.muted }} />
                      <p className="fb mt-3 text-sm font-semibold" style={{ color: C.muted }}>
                        {tab === "verifikasi" ? "Gak ada yang perlu diverifikasi. 🎉" : "Tidak ada peserta ditemukan."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((participant, idx) => {
                    const pst = paymentCfg(participant.paymentStatus);
                    const isExpanded = expandedId === participant.id;
                    return (
                      <Fragment key={participant.id}>
                        <tr
                          className="hover:bg-[#FDF5E4] transition"
                          style={{ borderTop: idx === 0 ? "none" : "2px dashed rgba(8,46,75,.2)" }}
                        >
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : participant.id)}
                              className="flex items-start gap-3 text-left"
                            >
                              <div
                                className="fd flex-shrink-0 h-10 w-10 rounded-full border-[2.5px] border-black flex items-center justify-center font-semibold text-white"
                                style={{
                                  background: [C.coral, C.blue, C.orange, C.lime, C.navy][idx % 5],
                                  boxShadow: "2px 2px 0 #000",
                                }}
                              >
                                {participant.nama.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-[160px]">
                                <div className="fb text-sm font-extrabold flex items-center gap-1.5" style={{ color: C.navy }}>
                                  {participant.jenisPeserta === "kelompok" ? `Tim ${participant.nama}` : participant.nama}
                                  <ChevronDownIcon
                                    className="w-3.5 h-3.5 transition-transform"
                                    style={{ transform: isExpanded ? "rotate(180deg)" : "none", color: C.muted }}
                                  />
                                </div>
                                <div className="fb text-xs font-semibold whitespace-nowrap" style={{ color: C.muted }}>
                                  {participant.email}
                                </div>
                                {participant.role && participant.role !== "PESERTA" && (
                                  <span
                                    className="fb mt-1 inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                                    style={{
                                      background: ROLE_BG[participant.role] || C.lime,
                                      color: participant.role === "DOSEN" || participant.role === "PENGURUS_HIMTI" ? "#fff" : C.navy,
                                    }}
                                  >
                                    {ROLE_LABEL[participant.role] || participant.role}
                                  </span>
                                )}
                              </div>
                            </button>
                          </td>
                          <td className="fb px-5 py-4 whitespace-nowrap text-sm font-bold" style={{ color: C.navy }}>
                            {participant.event?.nama_event || "-"}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2 items-start">
                              <span
                                className="fb px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                                style={{ background: statusBg(participant.status), color: C.navy }}
                              >
                                {participant.status}
                              </span>
                              <div className="flex gap-1.5">
                                {participant.status !== "hadir" && (
                                  <button
                                    onClick={() => updateParticipantStatus(participant.id, "hadir")}
                                    disabled={updatingId === participant.id}
                                    className="adm-btn adm-btn-sm px-2 py-1 text-[11px]"
                                    style={{ background: C.lime }}
                                  >
                                    Hadir
                                  </button>
                                )}
                                {participant.status !== "tidak_hadir" && (
                                  <button
                                    onClick={() => updateParticipantStatus(participant.id, "tidak_hadir")}
                                    disabled={updatingId === participant.id}
                                    className="adm-btn adm-btn-sm px-2 py-1 text-[11px]"
                                    style={{ background: C.orange, color: "#fff" }}
                                  >
                                    Absen
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2 items-start">
                              <span
                                className="fb px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                                style={{ background: pst.bg, color: pst.text }}
                              >
                                {pst.label}
                              </span>
                              <button
                                onClick={() => setReviewing(participant)}
                                className="adm-btn adm-btn-sm"
                                style={{ background: C.blue, color: "#fff" }}
                              >
                                <EyeIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> Review
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => requestAction("delete", participant)}
                              disabled={updatingId === participant.id}
                              className="adm-btn adm-btn-sm px-2.5 py-1 text-[11px]"
                              style={{ background: "#fff", color: C.coral }}
                              title="Hapus peserta"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                        {isExpanded && <DetailRow participant={participant} />}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
