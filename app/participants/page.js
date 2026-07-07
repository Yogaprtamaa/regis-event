"use client";
import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  UsersIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
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

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [search, statusFilter, eventFilter, paymentFilter, participants]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch participants
      const participantsRes = await fetch("/api/participants");
      if (!participantsRes.ok) {
        throw new Error(`Participants API error: ${participantsRes.status}`);
      }
      const participantsData = await participantsRes.json();
      if (!Array.isArray(participantsData)) {
        throw new Error("Participants data is not an array");
      }

      // Fetch events
      const eventsRes = await fetch("/api/events");
      if (!eventsRes.ok) {
        throw new Error(`Events API error: ${eventsRes.status}`);
      }
      const eventsData = await eventsRes.json();
      if (!Array.isArray(eventsData)) {
        throw new Error("Events data is not an array");
      }

      setParticipants(participantsData);
      setFilteredParticipants(participantsData);
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setParticipants([]);
      setFilteredParticipants([]);
      setEvents([]);
      setLoading(false);
    }
  }

  function filterParticipants() {
    let filtered = participants;

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.nim || "").includes(search) ||
          (p.jurusan || "").toLowerCase().includes(q) ||
          (p.divisi || "").toLowerCase().includes(q) ||
          (p.instansi || "").toLowerCase().includes(q),
      );
    }

    // Filter by payment
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (p) => (p.paymentStatus || "FREE") === paymentFilter,
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by event
    if (eventFilter !== "all") {
      filtered = filtered.filter((p) => p.eventId === eventFilter);
    }

    setFilteredParticipants(filtered);
  }

  async function updateParticipantStatus(participantId, newStatus) {
    try {
      setUpdatingId(participantId);
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengupdate status");
      }

      // Update both lists
      const updatedParticipant = await response.json();
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? updatedParticipant : p)),
      );
      setFilteredParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? updatedParticipant : p)),
      );
    } catch (error) {
      console.error("Error updating participant:", error);
      alert("Gagal mengupdate status peserta: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePaymentStatus(participantId, newPaymentStatus) {
    try {
      setUpdatingId(participantId);
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengupdate pembayaran");
      }

      const updatedParticipant = await response.json();

      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? updatedParticipant : p)),
      );
      setFilteredParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? updatedParticipant : p)),
      );
    } catch (error) {
      alert("Gagal update payment: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteParticipant(participantId) {
    if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      return;
    }

    try {
      setUpdatingId(participantId);
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal menghapus peserta");
      }

      // Remove from both lists
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setFilteredParticipants((prev) =>
        prev.filter((p) => p.id !== participantId),
      );
    } catch (error) {
      console.error("Error deleting participant:", error);
      alert("Gagal menghapus peserta: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const paymentBg = (status) => {
    switch ((status || "FREE").toUpperCase()) {
      case "APPROVED":
        return C.lime;
      case "PENDING":
        return C.yellow;
      case "REJECTED":
        return C.coral;
      case "FREE":
      default:
        return C.blue;
    }
  };

  const statusBg = (status) => {
    switch (status.toLowerCase()) {
      case "attended":
      case "hadir":
        return C.lime;
      case "registered":
      case "terdaftar":
        return C.yellow;
      case "cancelled":
      case "batal":
        return C.coral;
      default:
        return "#e2e8f0";
    }
  };

  const stats = {
    total: participants.length,
    attended: participants.filter(
      (p) =>
        p.status === "hadir" ||
        p.status === "ATTENDED" ||
        p.status === "attended",
    ).length,
    registered: participants.filter(
      (p) =>
        p.status === "terdaftar" ||
        p.status === "REGISTERED" ||
        p.status === "registered",
    ).length,
  };

  if (loading) return <Loading />;

  const statCards = [
    { label: "Total Peserta", value: stats.total, Icon: UsersIcon, sh: "sh-coral", bg: C.coral, rotate: "-0.8deg" },
    { label: "Hadir", value: stats.attended, Icon: CheckIcon, sh: "sh-lime", bg: C.lime, rotate: "0.7deg" },
    { label: "Terdaftar", value: stats.registered, Icon: CalendarIcon, sh: "sh-blue", bg: C.blue, rotate: "-0.5deg" },
  ];

  const inputCls = "adm-input";

  return (
    <div className="adm-bg">
      <RetroAdminStyles />

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
            Kelola kehadiran, pembayaran, dan data semua peserta.
          </p>
        </div>
      </div>

      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className={`pop-in adm-card adm-lift ${s.sh} p-6`}
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
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="pop-in adm-card sh-yellow p-5 sm:p-6 mb-8" style={{ "--d": "280ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: C.muted }} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Cari nama, email, NIM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
                style={{ paddingLeft: "2.6rem" }}
              />
            </div>

            <div className="relative">
              <FunnelIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10" style={{ color: C.muted }} strokeWidth={2.5} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputCls}
                style={{ paddingLeft: "2.6rem", appearance: "none" }}
              >
                <option value="all">Semua Status</option>
                <option value="terdaftar">Terdaftar</option>
                <option value="hadir">Hadir</option>
                <option value="batal">Batal</option>
              </select>
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className={inputCls}
              style={{ appearance: "none" }}
            >
              <option value="all">Semua Pembayaran</option>
              <option value="FREE">Free</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10" style={{ color: C.muted }} strokeWidth={2.5} />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className={inputCls}
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
          </div>

          <p className="fb mt-4 text-sm font-bold" style={{ color: C.navy }}>
            Menampilkan {filteredParticipants.length} dari {participants.length} peserta
          </p>
        </div>

        {/* Table */}
        <div className="pop-in adm-card sh-navy overflow-hidden" style={{ "--d": "380ms" }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: C.navy }}>
                  {["Peserta", "NIM", "Event", "Detail", "Instansi", "Status", "Role", "Kontak", "Pembayaran", "Bukti", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="fb px-5 py-4 text-left text-[10px] font-extrabold text-white uppercase tracking-[.14em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-14 text-center">
                      <UsersIcon className="mx-auto h-12 w-12" style={{ color: C.muted }} />
                      <p className="fb mt-3 text-sm font-semibold" style={{ color: C.muted }}>
                        Tidak ada peserta ditemukan.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant, idx) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-[#FDF5E4] transition"
                      style={{ borderTop: idx === 0 ? "none" : "2px dashed rgba(8,46,75,.2)" }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start">
                          <div
                            className="fd flex-shrink-0 h-10 w-10 rounded-full border-[2.5px] border-black flex items-center justify-center font-semibold text-white"
                            style={{
                              background: [C.coral, C.blue, C.orange, C.lime, C.navy][idx % 5],
                              boxShadow: "2px 2px 0 #000",
                            }}
                          >
                            {participant.nama.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3 min-w-[160px]">
                            <div className="fb text-sm font-extrabold whitespace-nowrap" style={{ color: C.navy }}>
                              {participant.jenisPeserta === "kelompok" ? `Tim ${participant.nama}` : participant.nama}
                            </div>
                            <div className="fb text-xs font-semibold whitespace-nowrap" style={{ color: C.muted }}>
                              {participant.email}
                            </div>
                            {Array.isArray(participant.anggota) && participant.anggota.length > 1 && (
                              <ul className="mt-1">
                                {participant.anggota.map((a, i) => (
                                  <li key={i} className="fb text-[11px] font-semibold whitespace-nowrap" style={{ color: C.muted }}>
                                    {i === 0 ? "Ketua" : `Anggota ${i}`} — {a.nama}{a.nim ? ` (${a.nim})` : ""}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="fb px-5 py-4 whitespace-nowrap text-sm font-bold" style={{ color: C.navy }}>
                        {participant.nim || "-"}
                      </td>
                      <td className="fb px-5 py-4 whitespace-nowrap text-sm font-bold" style={{ color: C.navy }}>
                        {participant.event?.nama_event || "-"}
                      </td>
                      <td className="fb px-5 py-4 whitespace-nowrap text-xs font-semibold" style={{ color: C.muted }}>
                        {participant.jurusan || participant.angkatan || participant.divisi ? (
                          <>
                            {participant.jurusan && <div>Jurusan: {participant.jurusan}</div>}
                            {participant.angkatan && <div>Angkatan: {participant.angkatan}</div>}
                            {participant.divisi && <div>Divisi: {participant.divisi}</div>}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="fb px-5 py-4 whitespace-nowrap text-sm font-bold" style={{ color: C.navy }}>
                        {participant.instansi || "-"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="fb px-3 py-1 inline-flex text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                          style={{ background: statusBg(participant.status), color: C.navy }}
                        >
                          {participant.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="fb px-3 py-1 inline-flex text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                          style={{
                            background: ROLE_BG[participant.role] || C.lime,
                            color: participant.role === "DOSEN" || participant.role === "PENGURUS_HIMTI" ? "#fff" : C.navy,
                          }}
                        >
                          {ROLE_LABEL[participant.role] || "Peserta"}
                        </span>
                      </td>
                      <td className="fb px-5 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: C.muted }}>
                        {participant.no_wa}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span
                            className="fb px-3 py-1 text-[10px] text-center font-extrabold uppercase rounded-full border-2 border-black"
                            style={{
                              background: paymentBg(participant.paymentStatus),
                              color: (participant.paymentStatus || "FREE") === "REJECTED" ? "#fff" : C.navy,
                            }}
                          >
                            {participant.paymentStatus || "FREE"}
                          </span>

                          {participant.paymentStatus === "PENDING" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => updatePaymentStatus(participant.id, "APPROVED")}
                                className="adm-btn adm-btn-sm px-2 py-1 text-[11px]"
                                style={{ background: C.lime }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(participant.id, "REJECTED")}
                                className="adm-btn adm-btn-sm px-2 py-1 text-[11px]"
                                style={{ background: C.coral, color: "#fff" }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        {participant.buktiPembayaran ? (
                          <Popup
                            trigger={
                              <button className="adm-btn adm-btn-sm" style={{ background: C.blue, color: "#fff" }}>
                                <EyeIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> Bukti
                              </button>
                            }
                            modal
                            nested
                            overlayStyle={{ background: "rgba(0,0,0,0.7)" }}
                            contentStyle={{
                              background: "transparent",
                              border: "none",
                              padding: "0",
                              width: "auto",
                            }}
                          >
                            {(close) => (
                              <div className="adm-card sh-blue w-full max-w-3xl overflow-hidden relative bg-white">
                                <div
                                  className="px-6 py-4 flex justify-between items-center"
                                  style={{ background: C.blue, borderBottom: "3px solid #000" }}
                                >
                                  <div>
                                    <h2 className="fd text-xl font-semibold text-white">Bukti Pembayaran</h2>
                                    <p className="fb text-xs font-semibold text-white/75">{participant.nama}</p>
                                  </div>
                                  <button
                                    onClick={close}
                                    aria-label="Tutup"
                                    className="fd w-9 h-9 rounded-full border-[2.5px] border-black bg-white text-xl leading-none hover:rotate-90 transition-transform"
                                    style={{ boxShadow: "2px 2px 0 #000", color: C.navy }}
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="p-6" style={{ background: C.sand }}>
                                  <div className="flex justify-center">
                                    <img
                                      src={participant.buktiPembayaran}
                                      alt="Bukti"
                                      className="rounded-xl border-[3px] border-black max-h-[500px] object-contain"
                                      style={{ boxShadow: "5px 5px 0 #000" }}
                                    />
                                  </div>

                                  <div className="flex justify-between items-center mt-6 text-sm">
                                    <a
                                      href={participant.buktiPembayaran}
                                      target="_blank"
                                      className="fb font-extrabold hover:underline"
                                      style={{ color: C.blue }}
                                    >
                                      Buka di tab baru
                                    </a>
                                    <a
                                      href={participant.buktiPembayaran}
                                      download
                                      className="adm-btn adm-btn-sm"
                                      style={{ background: C.lime }}
                                    >
                                      <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2.5} /> Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Popup>
                        ) : (
                          <span className="fb text-xs font-semibold italic" style={{ color: C.muted }}>
                            Tidak ada
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-1.5 flex-wrap">
                          {participant.status !== "hadir" && (
                            <button
                              onClick={() => updateParticipantStatus(participant.id, "hadir")}
                              disabled={updatingId === participant.id}
                              className="adm-btn adm-btn-sm px-2.5 py-1 text-[11px]"
                              style={{ background: C.lime }}
                              title="Tandai hadir"
                            >
                              {updatingId === participant.id ? "..." : "Hadir"}
                            </button>
                          )}
                          {participant.status !== "tidak_hadir" && (
                            <button
                              onClick={() => updateParticipantStatus(participant.id, "tidak_hadir")}
                              disabled={updatingId === participant.id}
                              className="adm-btn adm-btn-sm px-2.5 py-1 text-[11px]"
                              style={{ background: C.orange, color: "#fff" }}
                              title="Tandai tidak hadir"
                            >
                              {updatingId === participant.id ? "..." : "Absen"}
                            </button>
                          )}
                          <button
                            onClick={() => deleteParticipant(participant.id)}
                            disabled={updatingId === participant.id}
                            className="adm-btn adm-btn-sm px-2.5 py-1 text-[11px]"
                            style={{ background: "#fff", color: C.coral }}
                            title="Hapus peserta"
                          >
                            {updatingId === participant.id ? "..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
