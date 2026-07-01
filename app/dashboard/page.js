"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    activeEvents: 0,
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
    // Check server-side session (httpOnly cookie, tidak bisa dibaca dari JS)
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchDashboardData();
        } else {
          setShowPasswordModal(true);
        }
      } catch {
        setShowPasswordModal(true);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!res.ok) {
        setPasswordError("Password salah! Silakan coba lagi.");
        setPasswordInput("");
        return;
      }

      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordError("");
      fetchDashboardData();
    } catch {
      setPasswordError("Gagal menghubungi server. Coba lagi.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setShowPasswordModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

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
      const activeEvents = eventsData.filter((event) => {
        const eventDate = new Date(event.tanggal);
        // Event is active if it's today or within next 30 days
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      });

      const upcomingEvents = eventsData.filter((event) => {
        const eventDate = new Date(event.tanggal);
        return eventDate >= now;
      });

      setStats({
        totalEvents: eventsData.length,
        totalParticipants: participantsData.length,
        activeEvents: activeEvents.length,
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
        activeEvents: 0,
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

  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border-4 border-black max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-2xl border-4 border-black mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0_#000]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-8 h-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Dashboard Protected
            </h2>
            <p className="text-sm text-gray-600 font-bold">
              Masukkan password untuk mengakses dashboard
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full px-4 py-3 border-4 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-300 shadow-[4px_4px_0_#000]"
                autoFocus
              />
            </div>

            {passwordError && (
              <div className="bg-red-100 border-4 border-red-500 rounded-xl p-3">
                <p className="text-sm font-black text-red-700">
                  {passwordError}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 px-4 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase tracking-wider"
            >
              Masuk Dashboard
            </button>

            <Link
              href="/events"
              className="block text-center text-sm font-bold text-gray-600 hover:text-green-600 mt-4"
            >
              ← Kembali ke Events
            </Link>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Event HIMTI</title>
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Event HIMTI
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Selamat datang! Kelola event dan peserta Anda di sini.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Lihat Semua Event
              </Link>
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Buat Event Baru
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">Semua event</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Peserta
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalParticipants}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pendaftar terdaftar
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Event Aktif</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeEvents}
                </p>
                <p className="text-xs text-gray-500 mt-1">30 hari mendatang</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event Mendatang
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Daftar event yang akan datang
                  </p>
                </div>
                <Link
                  href="/events"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {events.length === 0 ? (
                  <div className="p-8 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Belum ada event
                    </p>
                    <Link
                      href="/events/create"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Buat Event Pertama
                    </Link>
                  </div>
                ) : (
                  events.map((event) => {
                    const eventDate = new Date(event.tanggal);
                    const isUpcoming = eventDate >= new Date();
                    const percentage = event.kapasitas
                      ? Math.round(
                          (event.participantCount / event.kapasitas) * 100,
                        )
                      : 0;

                    return (
                      <div
                        key={event.id}
                        className="p-6 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <Link
                                href={`/events/${event.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-green-600"
                              >
                                {event.nama_event}
                              </Link>
                            </div>

                            {event.deskripsi && (
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {event.deskripsi}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1.5" />
                                {eventDate.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1.5" />
                                {event.jam_mulai} - {event.jam_berakhir}
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1.5" />
                                {event.lokasi}
                              </div>
                            </div>

                            {event.kapasitas && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600 flex items-center">
                                    <UserGroupIcon className="h-4 w-4 mr-1" />
                                    Kapasitas
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {event.participantCount} / {event.kapasitas}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      percentage >= 90
                                        ? "bg-red-500"
                                        : percentage >= 70
                                          ? "bg-orange-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2 flex-wrap">
                              <button
                                onClick={() =>
                                  handleExportExcel(event.id, event.nama_event)
                                }
                                disabled={
                                  exportingId === event.id ||
                                  event.participantCount === 0
                                }
                                className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                title={
                                  event.participantCount === 0
                                    ? "Belum ada peserta"
                                    : "Export data peserta ke Excel"
                                }
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                {exportingId === event.id
                                  ? "Exporting..."
                                  : "Export Excel"}
                              </button>
                              <button
                                onClick={() => openEditModal(event)}
                                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deletingId === event.id}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === event.id ? "..." : "🗑️ Hapus"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Participants - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pendaftaran Terbaru
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Peserta yang baru mendaftar
                    </p>
                  </div>
                  <Link
                    href="/participants"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Lihat Semua →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentParticipants.length === 0 ? (
                  <div className="p-8 text-center">
                    <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Belum ada peserta
                    </p>
                  </div>
                ) : (
                  recentParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-semibold">
                            {participant.nama.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 mx-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.nama}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {participant.event?.nama_event ||
                              "Event tidak ditemukan"}
                          </p>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                participant.role === "DOSEN"
                                  ? "bg-purple-100 text-purple-700"
                                  : participant.role === "PANITIA"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {participant.role === "DOSEN"
                                ? "👨‍🏫 Dosen"
                                : participant.role === "PANITIA"
                                  ? "👔 Panitia"
                                  : "🎓 Peserta"}
                            </span>
                            {participant.jurusan && (
                              <span className="text-xs text-gray-500">
                                {participant.jurusan}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {participant.jurusan ??
                                participant.angkatan ??
                                "•"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {participant.angkatan}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              participant.status === "ATTENDED" ||
                              participant.status === "hadir"
                                ? "bg-green-100 text-green-800"
                                : participant.status === "REGISTERED" ||
                                    participant.status === "terdaftar"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {participant.status}
                          </span>
                          {participant.status !== "hadir" && (
                            <button
                              onClick={() =>
                                updateParticipantStatus(participant.id, "hadir")
                              }
                              disabled={updatingId === participant.id}
                              className="ml-2 px-2 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              title="Tandai hadir"
                            >
                              {updatingId === participant.id ? "..." : "✓"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/events/create"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-bold transition text-white shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Buat Event Baru
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-bold transition text-white shadow-sm"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Kelola Events
                </Link>
                <Link
                  href="/participants"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-bold transition text-white shadow-sm"
                >
                  <UsersIcon className="h-5 w-5" />
                  Kelola Peserta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Event
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Event
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nama_event || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nama_event: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={editFormData.deskripsi || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deskripsi: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.tanggal || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tanggal: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={editFormData.jam_mulai || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        jam_mulai: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam Berakhir
                </label>
                <input
                  type="time"
                  required
                  value={editFormData.jam_berakhir || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      jam_berakhir: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.lokasi || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, lokasi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas
                </label>
                <input
                  type="number"
                  value={editFormData.kapasitas || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      kapasitas: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
