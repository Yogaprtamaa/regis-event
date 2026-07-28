"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";
import Loading from "@/app/loading";
import {
  CalendarIcon,
  UsersIcon,
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const STAT_STYLES = [
  { sh: "sh-coral", bg: C.coral, rotate: "-1deg" },
  { sh: "sh-blue", bg: C.blue, rotate: "0.8deg" },
  { sh: "sh-lime", bg: C.lime, rotate: "-0.6deg" },
];

const EVENT_SH = ["sh-coral", "sh-blue", "sh-lime", "sh-yellow"];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    pendingVerification: 0,
    upcomingEvents: 0,
  });
  const [events, setEvents] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  async function handleExportExcel(eventId, eventName) {
    try {
      setExportingId(eventId);

      const response = await fetch(`/api/events/${eventId}/export`);

      if (!response.ok) {
        let errorMessage = "Export failed";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.message || errorBody?.error || errorMessage;
        } catch {
          errorMessage = `Export failed (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `peserta_${eventName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("✅ Data berhasil diexport!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert(`❌ Gagal export data: ${error.message}`);
    } finally {
      setExportingId(null);
    }
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch events
      const eventsRes = await fetch("/api/events");
      if (!eventsRes.ok) {
        throw new Error(`Events API error: ${eventsRes.status}`);
      }
      const eventsData = await eventsRes.json();
      if (!Array.isArray(eventsData)) {
        throw new Error("Events data is not an array");
      }

      // Fetch participants
      const participantsRes = await fetch("/api/participants");
      if (!participantsRes.ok) {
        throw new Error(`Participants API error: ${participantsRes.status}`);
      }
      const participantsData = await participantsRes.json();
      if (!Array.isArray(participantsData)) {
        throw new Error("Participants data is not an array");
      }

      // Calculate stats
      const now = new Date();
      const pendingVerification = participantsData.filter(
        (p) => (p.paymentStatus || "FREE") === "PENDING",
      ).length;

      const upcomingEvents = eventsData.filter((event) => {
        // Acara multi-hari masih "upcoming" sampai hari terakhirnya lewat.
        const eventDate = new Date(event.tanggal_berakhir || event.tanggal);
        return eventDate >= now;
      });

      setStats({
        totalEvents: eventsData.length,
        totalParticipants: participantsData.length,
        pendingVerification,
        upcomingEvents: upcomingEvents.length,
      });

      // Sort events by date (upcoming first)
      const sortedEvents = eventsData
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
        .slice(0, 5);

      // Add participant count to each event
      const eventsWithCount = sortedEvents.map((event) => ({
        ...event,
        participantCount: participantsData.filter((p) => p.eventId === event.id)
          .length,
      }));

      setEvents(eventsWithCount);

      // Get recent 5 participants
      setRecentParticipants(participantsData.slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data but don't show error to user, just log it
      setStats({
        totalEvents: 0,
        totalParticipants: 0,
        pendingVerification: 0,
        upcomingEvents: 0,
      });
      setEvents([]);
      setRecentParticipants([]);
      setLoading(false);
    }
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

      // Update UI
      setRecentParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, status: newStatus } : p,
        ),
      );
    } catch (error) {
      console.error("Error updating participant:", error);
      alert("Gagal mengupdate status peserta: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function openEditModal(event) {
    setEditingEvent(event);
    setEditFormData({
      nama_event: event.nama_event,
      deskripsi: event.deskripsi || "",
      tanggal: event.tanggal
        ? new Date(event.tanggal).toISOString().split("T")[0]
        : "",
      tanggal_berakhir: event.tanggal_berakhir
        ? new Date(event.tanggal_berakhir).toISOString().split("T")[0]
        : "",
      jam_mulai: event.jam_mulai,
      jam_berakhir: event.jam_berakhir,
      lokasi: event.lokasi,
      kapasitas: event.kapasitas || "",
    });
    setShowEditModal(true);
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditFormData({});
    setShowEditModal(false);
  }

  async function handleEditEvent(e) {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengupdate event");
      }

      const updatedEvent = await response.json();

      // Update events list
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? { ...updatedEvent, participantCount: e.participantCount }
            : e,
        ),
      );

      closeEditModal();
      alert("Event berhasil diupdate!");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Gagal mengupdate event: " + error.message);
    }
  }

  async function handleDeleteEvent(eventId) {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      return;
    }

    try {
      setDeletingId(eventId);
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal menghapus event");
      }

      // Update events list
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      alert("Event berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <Loading />;

  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      note: "Semua event",
      Icon: CalendarIcon,
    },
    {
      label: "Total Peserta",
      value: stats.totalParticipants,
      note: "Pendaftar terdaftar",
      Icon: UsersIcon,
    },
    {
      label: "Perlu Verifikasi",
      value: stats.pendingVerification,
      note: "Bukti bayar & berkas",
      Icon: ClockIcon,
      href: "/participants",
      highlight: stats.pendingVerification > 0,
    },
  ];

  return (
    <div className="adm-bg">
      <RetroAdminStyles />

      {/* ── Header: papan panitia ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="pop-in adm-card sh-navy px-6 py-6 sm:px-8 md:flex md:items-center md:justify-between">
          <div>
            <span className="adm-tag" style={{ background: C.yellow }}>
              IT FEST 6.0 · Panitia
            </span>
            <h1 className="fd text-4xl sm:text-5xl font-bold mt-3" style={{ color: C.navy, lineHeight: 0.95 }}>
              Meja Kontrol
            </h1>
            <p className="fb text-sm font-semibold mt-2" style={{ color: C.muted }}>
              Kelola event dan peserta dari sini.
            </p>
          </div>
          <div className="mt-5 md:mt-0 flex flex-wrap gap-3">
            <Link href="/events" className="adm-btn" style={{ background: C.blue, color: "#fff" }}>
              <CalendarIcon className="h-5 w-5" />
              Semua Event
            </Link>
            <Link href="/events/create" className="adm-btn" style={{ background: C.lime }}>
              <PlusIcon className="h-5 w-5" />
              Event Baru
            </Link>
            <Link href="/dashboard/lomba" className="adm-btn" style={{ background: C.coral, color: "#fff" }}>
              <TrophyIcon className="h-5 w-5" />
              Alur Penjurian
            </Link>
            <button onClick={handleLogout} className="adm-btn" style={{ background: "#fff", color: C.coral }}>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Stats: stiker angka ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((s, i) => {
            const st = STAT_STYLES[i];
            const Wrapper = s.href ? Link : "div";
            return (
              <Wrapper
                key={s.label}
                href={s.href}
                className={`pop-in adm-card adm-lift ${st.sh} p-6 ${s.highlight ? "ring-4 ring-black/10" : ""}`}
                style={{ "--d": `${120 + i * 100}ms`, "--r": st.rotate, transform: `rotate(${st.rotate})` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="fb text-[11px] font-extrabold uppercase tracking-[.14em]" style={{ color: C.muted }}>
                      {s.label}
                    </p>
                    <p className="fd text-5xl font-bold mt-1" style={{ color: s.highlight ? C.coral : C.navy }}>
                      {s.value}
                    </p>
                    <p className="fb text-xs font-semibold mt-1" style={{ color: C.muted }}>
                      {s.note}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-2xl border-[3px] border-black"
                    style={{ background: st.bg, boxShadow: "3px 3px 0 #000" }}
                  >
                    <s.Icon className="h-7 w-7 text-white" strokeWidth={2.2} />
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rundown event */}
          <div className="lg:col-span-2 pop-in" style={{ "--d": "300ms" }}>
            <div className="adm-card sh-navy overflow-hidden">
              <div
                className="px-6 py-5 flex justify-between items-center"
                style={{ borderBottom: "3px solid #000", background: C.navy }}
              >
                <div>
                  <h3 className="fd text-2xl font-semibold text-white">Rundown Event</h3>
                  <p className="fb text-xs font-semibold text-white/70 mt-0.5">
                    Yang paling dekat tampil duluan
                  </p>
                </div>
                <Link
                  href="/events"
                  className="fb text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white text-white hover:bg-white/15 transition"
                >
                  Semua →
                </Link>
              </div>

              {events.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12" style={{ color: C.muted }} />
                  <p className="fb mt-3 text-sm font-semibold" style={{ color: C.muted }}>
                    Panggung masih kosong. Bikin event pertama!
                  </p>
                  <Link href="/events/create" className="adm-btn mt-5" style={{ background: C.lime }}>
                    <PlusIcon className="h-5 w-5" />
                    Buat Event Pertama
                  </Link>
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  {events.map((event, i) => {
                    const eventDate = new Date(event.tanggal);
                    const percentage = event.kapasitas
                      ? Math.round((event.participantCount / event.kapasitas) * 100)
                      : 0;
                    const sh = EVENT_SH[i % EVENT_SH.length];

                    return (
                      <div
                        key={event.id}
                        className={`pop-in adm-card adm-lift ${sh} p-5`}
                        style={{ "--d": `${380 + i * 90}ms` }}
                      >
                        <Link
                          href={`/events/${event.id}`}
                          className="fd text-xl font-semibold hover:underline"
                          style={{ color: C.navy }}
                        >
                          {event.nama_event}
                        </Link>

                        {event.deskripsi && (
                          <p className="fb mt-1 text-sm font-medium line-clamp-2" style={{ color: C.muted }}>
                            {event.deskripsi}
                          </p>
                        )}

                        <div className="fb mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold" style={{ color: C.navy }}>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            {eventDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            {event.jam_mulai} - {event.jam_berakhir}
                          </span>
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1.5" />
                            {event.lokasi}
                          </span>
                        </div>

                        {event.kapasitas && (
                          <div className="mt-4">
                            <div className="fb flex items-center justify-between text-xs font-bold mb-1.5" style={{ color: C.navy }}>
                              <span className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                Kursi terisi
                              </span>
                              <span>
                                {event.participantCount} / {event.kapasitas}
                              </span>
                            </div>
                            <div className="adm-track">
                              <div
                                className="adm-fill"
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                  background:
                                    percentage >= 90 ? C.coral : percentage >= 70 ? C.orange : C.lime,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2.5 flex-wrap">
                          <Link
                            href={`/dashboard/absensi/${event.id}`}
                            className="adm-btn adm-btn-sm"
                            style={{ background: C.navy, color: "#fff" }}
                          >
                            <UserGroupIcon className="h-4 w-4" />
                            Absensi TM
                          </Link>
                          <button
                            onClick={() => handleExportExcel(event.id, event.nama_event)}
                            disabled={exportingId === event.id || event.participantCount === 0}
                            className="adm-btn adm-btn-sm"
                            style={{ background: C.lime }}
                            title={
                              event.participantCount === 0
                                ? "Belum ada peserta"
                                : "Export data peserta ke Excel"
                            }
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            {exportingId === event.id ? "Exporting..." : "Export Excel"}
                          </button>
                          <button
                            onClick={() => openEditModal(event)}
                            className="adm-btn adm-btn-sm"
                            style={{ background: C.blue, color: "#fff" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingId === event.id}
                            className="adm-btn adm-btn-sm"
                            style={{ background: "#fff", color: C.coral }}
                          >
                            {deletingId === event.id ? "..." : "Hapus"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Guest list + quick actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="pop-in adm-card sh-coral overflow-hidden" style={{ "--d": "400ms" }}>
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: "3px solid #000", background: C.coral }}
              >
                <div>
                  <h3 className="fd text-2xl font-semibold text-white">Guest List</h3>
                  <p className="fb text-xs font-semibold text-white/75 mt-0.5">
                    Pendaftar paling baru
                  </p>
                </div>
                <Link
                  href="/participants"
                  className="fb text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white text-white hover:bg-white/15 transition"
                >
                  Semua →
                </Link>
              </div>

              {recentParticipants.length === 0 ? (
                <div className="p-10 text-center">
                  <UsersIcon className="mx-auto h-12 w-12" style={{ color: C.muted }} />
                  <p className="fb mt-3 text-sm font-semibold" style={{ color: C.muted }}>
                    Belum ada yang daftar.
                  </p>
                </div>
              ) : (
                <div>
                  {recentParticipants.map((participant, i) => (
                    <div
                      key={participant.id}
                      className="pop-in p-4 flex items-start gap-3"
                      style={{
                        "--d": `${480 + i * 80}ms`,
                        borderBottom:
                          i < recentParticipants.length - 1 ? "2px dashed rgba(8,46,75,.25)" : "none",
                      }}
                    >
                      <div
                        className="fd flex-shrink-0 h-10 w-10 rounded-full border-[2.5px] border-black flex items-center justify-center font-semibold text-white"
                        style={{
                          background: [C.coral, C.blue, C.orange, C.lime, C.navy][i % 5],
                          boxShadow: "2px 2px 0 #000",
                        }}
                      >
                        {participant.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="fb text-sm font-extrabold truncate" style={{ color: C.navy }}>
                          {participant.jenisPeserta === "kelompok" ? `Tim ${participant.nama}` : participant.nama}
                        </p>
                        <p className="fb text-xs font-semibold truncate" style={{ color: C.muted }}>
                          {participant.event?.nama_event || "Event tidak ditemukan"}
                          {Array.isArray(participant.anggota) && participant.anggota.length > 1 && ` · ${participant.anggota.length} anggota`}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span
                            className="fb px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full border-2 border-black"
                            style={{
                              background:
                                participant.role === "DOSEN"
                                  ? C.blue
                                  : participant.role === "PANITIA"
                                    ? C.yellow
                                    : C.lime,
                              color: participant.role === "DOSEN" ? "#fff" : C.navy,
                            }}
                          >
                            {participant.role === "DOSEN"
                              ? "Dosen"
                              : participant.role === "PANITIA"
                                ? "Panitia"
                                : "Peserta"}
                          </span>
                          {participant.jurusan && (
                            <span className="fb text-[11px] font-semibold" style={{ color: C.muted }}>
                              {participant.jurusan}
                            </span>
                          )}
                          {participant.angkatan && (
                            <span className="fb text-[11px] font-semibold" style={{ color: C.muted }}>
                              '{String(participant.angkatan).slice(-2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="fb px-2 py-1 text-[10px] font-extrabold uppercase rounded-full border-2 border-black whitespace-nowrap"
                          style={{
                            background:
                              participant.status === "ATTENDED" || participant.status === "hadir"
                                ? C.lime
                                : "#fff",
                            color: C.navy,
                          }}
                        >
                          {participant.status}
                        </span>
                        {participant.status !== "hadir" && (
                          <button
                            onClick={() => updateParticipantStatus(participant.id, "hadir")}
                            disabled={updatingId === participant.id}
                            className="adm-btn adm-btn-sm px-2 py-1"
                            style={{ background: C.lime }}
                            title="Tandai hadir"
                          >
                            {updatingId === participant.id ? "..." : "✓"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="pop-in adm-card sh-yellow p-6" style={{ "--d": "550ms" }}>
              <h3 className="fd text-2xl font-semibold mb-4" style={{ color: C.navy }}>
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <Link href="/events/create" className="adm-btn w-full" style={{ background: C.lime }}>
                  <PlusIcon className="h-5 w-5" />
                  Buat Event Baru
                </Link>
                <Link href="/events" className="adm-btn w-full" style={{ background: C.blue, color: "#fff" }}>
                  <CalendarIcon className="h-5 w-5" />
                  Kelola Events
                </Link>
                <Link href="/participants" className="adm-btn w-full" style={{ background: C.coral, color: "#fff" }}>
                  <UsersIcon className="h-5 w-5" />
                  Kelola Peserta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Event Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="stamp-in adm-card sh-blue max-w-md w-full overflow-hidden" style={{ "--d": "0ms" }}>
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: C.blue, borderBottom: "3px solid #000" }}
            >
              <h3 className="fd text-2xl font-semibold text-white">Edit Event</h3>
              <button
                onClick={closeEditModal}
                aria-label="Tutup"
                className="fd w-9 h-9 rounded-full border-[2.5px] border-black bg-white text-xl leading-none hover:rotate-90 transition-transform"
                style={{ boxShadow: "2px 2px 0 #000", color: C.navy }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditEvent} className="p-6 space-y-4">
              <div>
                <label className="adm-label fb">Nama Event</label>
                <input
                  type="text"
                  required
                  value={editFormData.nama_event || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, nama_event: e.target.value })
                  }
                  className="adm-input"
                />
              </div>

              <div>
                <label className="adm-label fb">Deskripsi</label>
                <textarea
                  value={editFormData.deskripsi || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, deskripsi: e.target.value })
                  }
                  rows="3"
                  className="adm-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="adm-label fb">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={editFormData.tanggal || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tanggal: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label fb">Tanggal Berakhir</label>
                  <input
                    type="date"
                    min={editFormData.tanggal || undefined}
                    value={editFormData.tanggal_berakhir || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tanggal_berakhir: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label fb">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={editFormData.jam_mulai || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, jam_mulai: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
              </div>

              <div>
                <label className="adm-label fb">Jam Berakhir</label>
                <input
                  type="time"
                  required
                  value={editFormData.jam_berakhir || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, jam_berakhir: e.target.value })
                  }
                  className="adm-input"
                />
              </div>

              <div>
                <label className="adm-label fb">Lokasi</label>
                <input
                  type="text"
                  required
                  value={editFormData.lokasi || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, lokasi: e.target.value })
                  }
                  className="adm-input"
                />
              </div>

              <div>
                <label className="adm-label fb">Kapasitas</label>
                <input
                  type="number"
                  value={editFormData.kapasitas || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, kapasitas: e.target.value })
                  }
                  className="adm-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="adm-btn flex-1">
                  Batal
                </button>
                <button type="submit" className="adm-btn flex-1" style={{ background: C.lime }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
