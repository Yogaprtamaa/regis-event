"use client";

import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, Link } from "../utils/inertia-compat";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  ArrowLeftIcon,
  BoltIcon,
  TrophyIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

const ACCENTS = [
  { bg: "#EB3C6B", btn: "#EB3C6B", bar: "#FED245", tag: "rgba(0,0,0,0.18)", tagText: "#fff" },
  { bg: "#31AECE", btn: "#31AECE", bar: "#FED245", tag: "rgba(0,0,0,0.18)", tagText: "#fff" },
  { bg: "#F6890C", btn: "#F6890C", bar: "#FED245", tag: "rgba(0,0,0,0.18)", tagText: "#fff" },
  { bg: "#082E4B", btn: "#EB3C6B", bar: "#FED245", tag: "#FED245", tagText: "#082E4B" },
  { bg: "#EB3C6B", btn: "#082E4B", bar: "#FED245", tag: "rgba(0,0,0,0.18)", tagText: "#fff" },
];

const STATUS_CFG = {
  PUBLISHED: { color: "#B5D948", textColor: "#082E4B", label: "Open Now" },
  DRAFT: { color: "#e2e8f0", textColor: "#000", label: "Draft" },
  CLOSED: { color: "#f87171", textColor: "#fff", label: "Closed" },
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
    body {
        background-color: #FDF5E4;
        background-image:
            repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px),
            repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px);
        background-size: 28px 28px;
    }
    .font-fredoka { font-family: 'Fredoka', sans-serif; }
    .b-border    { border: 3px solid #1a1a1a; }
    .b-shadow    { box-shadow: 8px 8px 0px #1a1a1a; }
    .b-shadow-sm { box-shadow: 4px 4px 0px #1a1a1a; }
    .b-btn       { box-shadow: 4px 4px 0px #1a1a1a; transition: all 0.1s; }
    .b-btn:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0px #1a1a1a; }
    .b-btn:active { transform: translate(2px,2px); box-shadow: 0px 0px 0px #1a1a1a; }
    .bg-dots { background-image: radial-gradient(#1a1a1a 1.5px, transparent 1.5px); background-size: 24px 24px; opacity: 0.05; pointer-events: none; }
    @keyframes heroIn  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(18px)}  to{opacity:1;transform:translateX(0)} }
    @keyframes popIn   { 0%{transform:scale(0.5) rotate(-8deg);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
    @keyframes bar     { from{width:0} }
    .sh-heroIn  { animation: heroIn  0.55s cubic-bezier(.22,1,.36,1) both }
    .sh-fadeUp  { animation: fadeUp  0.5s  cubic-bezier(.22,1,.36,1) 0.06s both }
    .sh-slideIn { animation: slideIn 0.45s cubic-bezier(.22,1,.36,1) both }
    .sh-popIn   { animation: popIn   0.6s  cubic-bezier(.34,1.56,.64,1) both }
    .sh-bar     { animation: bar     1.2s  ease both }
`;

export default function ShowEvent({
  auth,
  event,
  remainingQuota,
  canRegister,
  eventId,
}) {
  const [step, setStep] = useState("detail");
  const [formData, setFormData] = useState({
    jenisPeserta: "individu", // "individu" | "kelompok"
    email: "",
    no_wa: "",
    universitas: "",
    fakultas: "",
    jurusan: "", // Program Studi
    kotaDomisili: "",
    provinsi: "",
    buktiFollow: null, // file (screenshot follow IG)
    fotoKtm: [], // files (KTM seluruh anggota)
  });
  // Anggota: ketua di index 0; maksimal 4 orang dalam 1 kelompok
  const [members, setMembers] = useState([{ nama: "", nim: "" }]);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const MAX_MEMBERS = 4;

  // Guard: return early if event is not available
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">Event tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!auth.user;
  const isAdmin = auth.user?.role === "admin";
  const eventDate = new Date(event.tanggal);
  const isUpcoming = eventDate > new Date();
  const filled = event._count?.participants || 0;
  const fillPct = Math.min(Math.round((filled / event.kapasitas) * 100), 100);

  // Hash UUID string to consistent number for accent selection
  const hashUUID = (uuid) => {
    if (!uuid) return 0;
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const acc = ACCENTS[hashUUID(event.id) % ACCENTS.length];
  const status = STATUS_CFG[event.status] || STATUS_CFG.DRAFT;

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // ── Anggota kelompok ──
  const updateMember = (index, key, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [key]: value } : m)),
    );
  };

  const addMember = () => {
    setMembers((prev) =>
      prev.length < MAX_MEMBERS ? [...prev, { nama: "", nim: "" }] : prev,
    );
  };

  const removeMember = (index) => {
    setMembers((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  // Saat ganti jenis peserta, sesuaikan jumlah anggota
  const setJenisPeserta = (value) => {
    handleInputChange("jenisPeserta", value);
    if (value === "individu") setMembers((prev) => [prev[0] || { nama: "", nim: "" }]);
  };

  //   const handleRegister = async (e) => {
  //     e.preventDefault();

  //     // Validate required fields
  //     const newErrors = {};
  //     if (!formData.nama) newErrors.nama = "Nama lengkap harus diisi";
  //     if (!formData.email) newErrors.email = "Email harus diisi";
  //     if (!formData.no_wa) newErrors.no_wa = "WhatsApp harus diisi";
  //     if (
  //       (formData.role === "MAHASISWA" ||
  //         formData.role === "PANITIA" ||
  //         formData.role === "PENGURUS_HIMTI") &&
  //       !formData.nim
  //     )
  //       newErrors.nim = "NIM harus diisi";
  //     if (
  //       (formData.role === "PANITIA" || formData.role === "PENGURUS_HIMTI") &&
  //       !formData.divisi
  //     )
  //       newErrors.divisi = "Divisi harus diisi";
  //     if (formData.role === "PESERTA" && !formData.instansi)
  //       newErrors.instansi = "Instansi harus diisi";
  //     if (
  //       (formData.role === "MAHASISWA" ||
  //         formData.role === "PANITIA" ||
  //         formData.role === "PENGURUS_HIMTI") &&
  //       !formData.angkatan
  //     )
  //       newErrors.angkatan = "Angkatan harus diisi";
  //     if (
  //       (formData.role === "PENGURUS_HIMTI" || formData.role === "MAHASISWA") &&
  //       !formData.prodi
  //     )
  //       newErrors.prodi = "Program Studi harus diisi";

  //     if (event.isPaidEvent && !formData.bukti_pembayaran) {
  //       newErrors.bukti_pembayaran = "Bukti pembayaran wajib diupload";
  //     }

  //     if (Object.keys(newErrors).length > 0) {
  //       setErrors(newErrors);
  //       return;
  //     }

  //     setProcessing(true);
  //     try {
  //       const response = await fetch("/api/participants", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           ...formData,
  //           eventId: event.id,
  //         }),
  //       });

  //       if (!response.ok) {
  //         const error = await response.json();
  //         throw new Error(error.message || "Gagal mendaftar");
  //       }

  //       setStep("success");
  //       setFormData({
  //         nama: "",
  //         email: "",
  //         no_wa: "",
  //         role: "MAHASISWA",
  //         nim: "",
  //         divisi: "",
  //         instansi: "",
  //         angkatan: "",
  //         prodi: "",
  //       });
  //     } catch (error) {
  //       setErrors({ submit: error.message });
  //     } finally {
  //       setProcessing(false);
  //     }
  //   };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ── Validasi ──
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email harus diisi";
    if (!formData.no_wa) newErrors.no_wa = "Nomor WhatsApp harus diisi";
    if (!formData.universitas) newErrors.universitas = "Universitas harus diisi";
    if (!formData.fakultas) newErrors.fakultas = "Fakultas harus diisi";
    if (!formData.jurusan) newErrors.jurusan = "Program Studi harus diisi";
    if (!formData.kotaDomisili) newErrors.kotaDomisili = "Kota domisili harus diisi";
    if (!formData.provinsi) newErrors.provinsi = "Provinsi harus diisi";

    const activeMembers = members.filter((m) => m.nama.trim() || m.nim.trim());
    if (activeMembers.length === 0 || !members[0].nama.trim()) {
      newErrors.members = "Minimal nama ketua/peserta harus diisi";
    }
    members.forEach((m, i) => {
      if (m.nama.trim() && !m.nim.trim()) newErrors[`nim_${i}`] = "NIM wajib diisi";
      if (!m.nama.trim() && m.nim.trim()) newErrors[`nama_${i}`] = "Nama wajib diisi";
    });

    if (!formData.buktiFollow) newErrors.buktiFollow = "Bukti follow IG wajib diupload";
    if (!formData.fotoKtm || formData.fotoKtm.length === 0)
      newErrors.fotoKtm = "Foto KTM wajib diupload";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setProcessing(true);
    try {
      const form = new FormData();
      const cleanMembers = members.filter((m) => m.nama.trim());

      form.append("jenisPeserta", formData.jenisPeserta);
      form.append("kategori", event.nama_event);
      form.append("nama", cleanMembers[0].nama); // ketua
      form.append("nim", cleanMembers[0].nim);
      form.append("email", formData.email);
      form.append("no_wa", formData.no_wa);
      form.append("universitas", formData.universitas);
      form.append("fakultas", formData.fakultas);
      form.append("jurusan", formData.jurusan);
      form.append("kotaDomisili", formData.kotaDomisili);
      form.append("provinsi", formData.provinsi);
      form.append("anggota", JSON.stringify(cleanMembers));
      form.append("eventId", event.id);

      if (formData.buktiFollow) form.append("buktiFollow", formData.buktiFollow);
      (formData.fotoKtm || []).forEach((file) => form.append("fotoKtm", file));

      const response = await fetch("/api/participants", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mendaftar");
      }

      setStep("success");
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const getFormFields = () => {
    const baseFields = [
      {
        key: "nama",
        label: "Nama Lengkap",
        placeholder: "Nama lengkap kamu",
        type: "text",
        required: true,
      },
      {
        key: "email",
        label: "Email",
        placeholder: "nama@email.com",
        type: "email",
        required: true,
      },
      {
        key: "no_wa",
        label: "WhatsApp",
        placeholder: "081234567890",
        type: "tel",
        required: true,
      },
    ];

    const roleField = {
      key: "role",
      label: "Mendaftar Sebagai",
      placeholder: "",
      type: "select",
      required: true,
      options: [
        { value: "MAHASISWA", label: "🎓 Mahasiswa" },
        { value: "PENGURUS_HIMTI", label: "👔 Pengurus HIMTI" },
        { value: "PESERTA", label: "👤 Peserta" },
        { value: "DOSEN", label: "👨‍🏫 Dosen" },
        { value: "PANITIA", label: "🎯 Panitia" },
      ],
    };

    const conditionalFields = [];

    // Upload Bukti Pembayaran (hanya jika event berbayar)
    if (event.isPaidEvent) {
      conditionalFields.push({
        key: "bukti_pembayaran",
        label: "Upload Bukti Pembayaran",
        type: "file",
        required: true,
      });
    }

    // NIM untuk Mahasiswa, Panitia, dan Pengurus HIMTI
    if (
      formData.role === "MAHASISWA" ||
      formData.role === "PANITIA" ||
      formData.role === "PENGURUS_HIMTI"
    ) {
      conditionalFields.push({
        key: "nim",
        label: "NIM",
        placeholder: "Nomor Induk Mahasiswa",
        type: "text",
        required: true,
      });
    }

    // Program Studi untuk Pengurus HIMTI dan Mahasiswa
    if (formData.role === "PENGURUS_HIMTI" || formData.role === "MAHASISWA") {
      conditionalFields.push({
        key: "jurusan",
        label: "Program Studi",
        placeholder: "",
        type: "select",
        required: true,
        options: [
          { value: "Teknik Informatika", label: "Teknik Informatika" },
          {
            value: "Desain Komunikasi Visual",
            label: "Desain Komunikasi Visual",
          },
          { value: "Desain Produk", label: "Desain Produk" },
          { value: "Manajemen dan Bisnis", label: "Manajemen dan Bisnis" },
          { value: "Falsafah dan Agama", label: "Falsafah dan Agama" },
          { value: "Hubungan Internasional", label: "Hubungan Internasional" },
          { value: "Ilmu Komunikasi", label: "Ilmu Komunikasi" },
          { value: "Psikologi", label: "Psikologi" },
        ],
      });
    }

    // Divisi untuk Panitia dan Pengurus HIMTI
    if (formData.role === "PANITIA" || formData.role === "PENGURUS_HIMTI") {
      conditionalFields.push({
        key: "divisi",
        label: "Divisi",
        placeholder: "Contoh: Acara, Humas, dll",
        type: "text",
        required: true,
      });
    }

    // Angkatan untuk Mahasiswa, Panitia, dan Pengurus HIMTI
    if (
      formData.role === "MAHASISWA" ||
      formData.role === "PANITIA" ||
      formData.role === "PENGURUS_HIMTI"
    ) {
      conditionalFields.push({
        key: "angkatan",
        label: "Angkatan",
        placeholder: "Contoh: 2023",
        type: "text",
        required: true,
      });
    }

    // Instansi untuk Peserta
    if (formData.role === "PESERTA") {
      conditionalFields.push({
        key: "instansi",
        label: "Instansi",
        placeholder: "Nama instansi/universitas",
        type: "text",
        required: true,
      });
    }

    return [...baseFields, roleField, ...conditionalFields];
  };

  /* render fn, not component  avoids input remount on typing */
  const renderSidebar = () => {
    /* SUCCESS */
    if (step === "success")
      return (
        <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
          <div
            className="relative px-6 py-10 text-center overflow-hidden"
            style={{ background: acc.bg }}
          >
            <div className="font-fredoka absolute right-3 -bottom-4 font-bold text-white/10 leading-none text-[120px] select-none pointer-events-none"></div>
            <div className="relative">
              <div
                className="w-[72px] h-[72px] bg-white b-border flex items-center justify-center mx-auto mb-4 rounded-2xl sh-popIn"
                style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                <CheckBadgeIcon className="w-9 h-9" style={{ color: acc.bg }} />
              </div>
              <h3
                className="font-fredoka text-2xl font-bold text-white mb-1"
                style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
              >
                Berhasil!{" "}
              </h3>
              <p className="text-white/70 text-sm font-bold">
                Kamu sudah terdaftar!
              </p>
            </div>
          </div>

          {/* ticket notch */}
          <div className="relative h-0">
            <div
              className="absolute -left-3.5 -top-3.5 w-7 h-7 rounded-full b-border"
              style={{ background: "#FDF5E4" }}
            />
            <div
              className="absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full b-border"
              style={{ background: "#FDF5E4" }}
            />
          </div>

          <div className="px-5 pt-5 pb-5 space-y-3">
            <div className="border-t-2 border-dashed border-slate-300 mb-1" />
            <div className="p-4 bg-slate-50 b-border rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Event
              </p>
              <p className="text-sm font-black text-slate-900 leading-snug">
                {event.nama_event}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Tanggal",
                  val: eventDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
                {
                  label: "Waktu",
                  val: `${event.jam_mulai}-${event.jam_berakhir}`,
                },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="p-3 bg-slate-50 b-border rounded-xl"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className="text-xs font-black text-slate-800">{val}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 b-border rounded-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Lokasi
              </p>
              <p className="text-xs font-black text-slate-800 truncate">
                {event.lokasi}
              </p>
            </div>
            <div className="flex items-center gap-2.5 b-border rounded-2xl px-4 py-3" style={{ background: "#fff7e6" }}>
              <EnvelopeIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "#EB3C6B" }} />
              <p className="text-xs font-black" style={{ color: "#EB3C6B" }}>
                Konfirmasi dikirim ke email kamu
              </p>
            </div>
            <Link
              href="/events"
              className="b-btn b-border flex items-center justify-center w-full gap-2 py-3.5 text-sm font-black text-white rounded-2xl uppercase tracking-widest"
              style={{ background: "#1a1a1a" }}
            >
              Lihat Event Lainnya
            </Link>
          </div>
        </div>
      );

    /* FORM */
    if (step === "form") {
      const labelCls =
        "block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5";
      const inputBase =
        "w-full px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all b-border bg-white text-slate-900";
      const sh = (err) => ({
        boxShadow: err ? "3px 3px 0 #f87171" : "3px 3px 0 #1a1a1a",
      });
      return (
        <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
          <div
            className="relative px-5 py-5 overflow-hidden"
            style={{ background: acc.bg }}
          >
            <div className="font-fredoka absolute right-2 -bottom-3 font-bold text-white/10 leading-none text-[80px] select-none pointer-events-none">
              {event.nama_event.charAt(0)}
            </div>
            <div className="relative">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Formulir Pendaftaran
              </p>
              <h3
                className="font-fredoka text-xl font-bold text-white leading-tight line-clamp-1"
                style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
              >
                {event.nama_event}
              </h3>
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-5">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm font-bold">
                {errors.submit}
              </div>
            )}
            <div className="space-y-3.5">
              {/* 1. Jenis Peserta */}
              <div>
                <label className={labelCls}>
                  Jenis Peserta<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "individu", l: "👤 Individu" },
                    { v: "kelompok", l: "👥 Kelompok" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setJenisPeserta(o.v)}
                      className="b-btn b-border py-2.5 rounded-xl text-xs font-black uppercase tracking-wide"
                      style={{
                        background:
                          formData.jenisPeserta === o.v ? acc.bg : "#fff",
                        color:
                          formData.jenisPeserta === o.v ? "#fff" : "#475569",
                        boxShadow: "3px 3px 0 #1a1a1a",
                      }}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                {formData.jenisPeserta === "kelompok" && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1.5">
                    Maksimal 4 orang dalam 1 kelompok.
                  </p>
                )}
              </div>

              {/* 2. Kategori Lomba (sesuai halaman) */}
              <div>
                <label className={labelCls}>
                  Kategori Lomba<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-black b-border flex items-center gap-2"
                  style={{
                    background: "#f8fafc",
                    color: acc.bg,
                    boxShadow: "3px 3px 0 #1a1a1a",
                  }}
                >
                  <TrophyIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} /> {event.nama_event}
                </div>
              </div>

              {/* 3 & 4. Nama + NIM (per anggota, maks 4) */}
              <div>
                <label className={labelCls}>
                  {formData.jenisPeserta === "kelompok"
                    ? "Data Anggota Kelompok"
                    : "Data Peserta"}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="space-y-2.5">
                  {members.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl b-border"
                      style={{
                        background: "#f8fafc",
                        boxShadow: "3px 3px 0 #1a1a1a",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {i === 0
                            ? formData.jenisPeserta === "kelompok"
                              ? "Ketua"
                              : "Peserta"
                            : `Anggota ${i + 1}`}
                        </span>
                        {formData.jenisPeserta === "kelompok" &&
                          members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMember(i)}
                              className="text-[10px] font-black text-red-500 uppercase tracking-wide"
                            >
                              Hapus
                            </button>
                          )}
                      </div>
                      <input
                        type="text"
                        value={m.nama}
                        onChange={(e) => updateMember(i, "nama", e.target.value)}
                        placeholder="Nama lengkap"
                        className={inputBase + " mb-2"}
                        style={sh(errors[`nama_${i}`])}
                      />
                      <input
                        type="text"
                        value={m.nim}
                        onChange={(e) => updateMember(i, "nim", e.target.value)}
                        placeholder="NIM"
                        className={inputBase}
                        style={sh(errors[`nim_${i}`])}
                      />
                    </div>
                  ))}
                </div>
                {formData.jenisPeserta === "kelompok" &&
                  members.length < MAX_MEMBERS && (
                    <button
                      type="button"
                      onClick={addMember}
                      className="b-btn b-border w-full mt-2 py-2 rounded-xl text-xs font-black text-slate-700 bg-white uppercase tracking-wide"
                      style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
                    >
                      + Tambah Anggota ({members.length}/{MAX_MEMBERS})
                    </button>
                  )}
                {errors.members && (
                  <p className="text-[11px] text-red-500 mt-1 font-black">
                    {errors.members}
                  </p>
                )}
              </div>

              {/* 5-10. Field teks */}
              {[
                { key: "universitas", label: "Universitas", ph: "Nama universitas", type: "text" },
                { key: "fakultas", label: "Fakultas", ph: "Nama fakultas", type: "text" },
                { key: "jurusan", label: "Program Studi", ph: "Nama program studi", type: "text" },
                { key: "kotaDomisili", label: "Kota Domisili", ph: "Kota tempat tinggal", type: "text" },
                { key: "provinsi", label: "Provinsi", ph: "Nama provinsi", type: "text" },
                { key: "email", label: "Email", ph: "nama@email.com", type: "email" },
                { key: "no_wa", label: "Nomor WhatsApp", ph: "081234567890", type: "tel" },
              ].map((f) => (
                <div key={f.key}>
                  <label className={labelCls}>
                    {f.label}<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type={f.type}
                    value={formData[f.key]}
                    onChange={(e) => handleInputChange(f.key, e.target.value)}
                    placeholder={f.ph}
                    className={inputBase}
                    style={sh(errors[f.key])}
                  />
                  {errors[f.key] && (
                    <p className="text-[11px] text-red-500 mt-1 font-black">
                      {errors[f.key]}
                    </p>
                  )}
                </div>
              ))}

              {/* 11. Bukti follow IG */}
              <div>
                <label className={labelCls}>
                  Bukti Follow IG @itfest &amp; @himti
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange("buktiFollow", e.target.files[0])
                  }
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-white b-border"
                  style={sh(errors.buktiFollow)}
                />
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Screenshot follow kedua akun (1 gambar).
                </p>
                {errors.buktiFollow && (
                  <p className="text-[11px] text-red-500 mt-1 font-black">
                    {errors.buktiFollow}
                  </p>
                )}
              </div>

              {/* 12. Foto KTM */}
              <div>
                <label className={labelCls}>
                  Foto KTM (Seluruh Anggota)
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    handleInputChange("fotoKtm", Array.from(e.target.files))
                  }
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-white b-border"
                  style={sh(errors.fotoKtm)}
                />
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Bisa pilih beberapa file sekaligus (1 KTM per anggota).
                </p>
                {formData.fotoKtm?.length > 0 && (
                  <p className="text-[10px] font-black text-slate-600 mt-1">
                    {formData.fotoKtm.length} file dipilih
                  </p>
                )}
                {errors.fotoKtm && (
                  <p className="text-[11px] text-red-500 mt-1 font-black">
                    {errors.fotoKtm}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="submit"
                disabled={processing}
                className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                style={{ background: acc.btn }}
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  <>
                    <CheckBadgeIcon className="w-4 h-4" />
                    Konfirmasi Pendaftaran
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep("detail")}
                className="b-btn b-border w-full py-3 rounded-2xl text-sm font-black text-slate-700 bg-white uppercase tracking-widest"
              >
                Kembali
              </button>
            </div>
          </form>
        </div>
      );
    }

    /* DETAIL */
    return (
      <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
        {/* price header */}
        <div
          className="relative px-5 py-6 overflow-hidden"
          style={{ background: acc.bg }}
        >
          <div className="font-fredoka absolute right-2 -bottom-4 font-bold text-white/10 leading-none text-[100px] select-none pointer-events-none"></div>
          <div className="relative">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">
              Akses Event
            </p>
            <div className="flex items-end justify-between gap-3">
              <span
                className="font-fredoka text-4xl font-bold text-white"
                style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}
              >
                {event.isPaidEvent ? "BERBAYAR" : "GRATIS"}
              </span>
              <span
                className="b-border text-[10px] bg-white text-black px-3 py-1.5 rounded-full font-black uppercase tracking-wide"
                style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
              >
                HIMTI Event
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* meta */}
          {[
            {
              Icon: CalendarIcon,
              label: "Tanggal",
              val: eventDate.toLocaleDateString("id-ID", { dateStyle: "long" }),
            },
            {
              Icon: ClockIcon,
              label: "Waktu",
              val: `${event.jam_mulai} - ${event.jam_berakhir}`,
            },
            {
              Icon: MapPinIcon,
              label: "Lokasi",
              val: event.lokasi,
              trunc: true,
            },
          ].map(({ Icon, label, val, trunc }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 b-border rounded-2xl bg-white"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 b-border"
                style={{ background: acc.tag, boxShadow: "2px 2px 0 #1a1a1a" }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: acc.tagText === "#fff" ? "#fff" : "#1a1a1a" }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {label}
                </p>
                <p
                  className={`text-xs font-black text-slate-900 mt-0.5 ${trunc ? "truncate" : ""}`}
                >
                  {val}
                </p>
              </div>
            </div>
          ))}

          {/* quota */}
          <div className="p-4 b-border rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <UsersIcon className="w-3.5 h-3.5" /> {filled} peserta
              </span>
              <span
                className={`text-xs font-black ${remainingQuota <= 10 ? "text-red-500" : "text-slate-500"}`}
              >
                {remainingQuota === 0 ? "PENUH" : `${remainingQuota} sisa`}
              </span>
            </div>
            <div className="relative h-4 w-full bg-slate-100 b-border rounded-full overflow-hidden">
              <div
                className="sh-bar absolute top-0 left-0 h-full rounded-full border-r-2 border-black"
                style={{
                  width: `${fillPct}%`,
                  background: fillPct >= 80 ? "#f87171" : acc.bar,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-right font-black">
              {fillPct}% dari {event.kapasitas} kursi
            </p>
          </div>

          {/* CTA */}
          {!isAdmin && canRegister && (
            <button
              onClick={() => setStep("form")}
              className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2.5 uppercase tracking-widest"
              style={{ background: acc.btn, boxShadow: "5px 5px 0 #000" }}
            >
              <BoltIcon className="w-4 h-4" strokeWidth={3} />
              Bergabunglah Sekarang!
            </button>
          )}
          {!isAdmin && !canRegister && (
            <div className="w-full py-4 b-border text-sm font-black text-center rounded-2xl bg-slate-100 text-slate-400 cursor-not-allowed">
              {remainingQuota === 0
                ? "🚫 Pendaftaran Penuh"
                : "🔒 Pendaftaran Ditutup"}
            </div>
          )}
          {isAdmin && (
            <Link
              href={`/events/${event.id}/participants`}
              className="b-btn b-border flex items-center justify-center w-full gap-2 py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest"
              style={{ background: acc.btn }}
            >
              <UsersIcon className="w-4 h-4" strokeWidth={3} /> Kelola Peserta
            </Link>
          )}

          <p className="text-[11px] text-center text-slate-400 font-black uppercase tracking-wider">
            Event HIMTI Terbuka Umum Email Konfirmasi
          </p>
        </div>
      </div>
    );
  };

  const pageBody = (
    <div className="min-h-screen">
      <style>{CSS}</style>

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: acc.bg, minHeight: "300px" }}
      >
        {event.poster && (
          <img
            src={`/storage/${event.poster}`}
            alt={event.nama_event}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.08 }}
          />
        )}
        {/* big letter bg */}
        <div
          className="font-fredoka absolute right-6 -bottom-6 font-bold text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "clamp(8rem, 25vw, 20rem)" }}
        >
          {event.nama_event.charAt(0)}
        </div>

        <div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sh-heroIn"
          style={{
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/events"
            className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black w-fit uppercase tracking-wider"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" strokeWidth={3} />
            Kembali ke Event
          </Link>

          <div className="mt-10">
            <h1
              className="font-fredoka font-bold text-white mb-6 leading-none max-w-3xl"
              style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                textShadow: "4px 4px 0 rgba(0,0,0,0.25)",
              }}
            >
              {event.nama_event}
            </h1>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  Icon: CalendarIcon,
                  text: eventDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                },
                { Icon: MapPinIcon, text: event.lokasi },
                { Icon: UsersIcon, text: `${filled}/${event.kapasitas} pendaftar` },
              ].map(({ Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 bg-black/20 text-white text-[12px] font-black px-3.5 py-1.5 rounded-2xl backdrop-blur-sm border border-white/20"
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} /> {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 sh-fadeUp">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
              <div
                className="px-6 py-4 border-b-3 flex items-center gap-3"
                style={{ borderBottom: "3px solid #1a1a1a" }}
              >
                <div
                  className="w-3 h-6 rounded-sm"
                  style={{ background: acc.bg }}
                />
                <h2 className="font-fredoka text-xl font-bold text-slate-900 uppercase tracking-wide">
                  Tentang Event
                </h2>
              </div>
              <div className="px-6 py-6">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[14px] sm:text-[15px] font-medium">
                  {event.deskripsi}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ borderBottom: "3px solid #1a1a1a" }}
              >
                <div
                  className="w-3 h-6 rounded-sm"
                  style={{ background: acc.bar }}
                />
                <h2 className="font-fredoka text-xl font-bold text-slate-900 uppercase tracking-wide">
                  Informasi Event
                </h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                {/* Tanggal - Full Width */}
                <div className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl text-xl"
                    style={{
                      background: acc.tag,
                      boxShadow: "2px 2px 0 #1a1a1a",
                    }}
                  >
                    📅
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Tanggal
                    </p>
                    <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                      {eventDate.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Jam Mulai dan Jam Berakhir - Flex */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl text-xl"
                      style={{
                        background: acc.tag,
                        boxShadow: "2px 2px 0 #1a1a1a",
                      }}
                    >
                      🕐
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Jam Mulai
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                        {event.jam_mulai}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl text-xl"
                      style={{
                        background: acc.tag,
                        boxShadow: "2px 2px 0 #1a1a1a",
                      }}
                    >
                      🕐
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Jam Berakhir
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                        {event.jam_berakhir}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lokasi - Full Width */}
                <div className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl"
                    style={{
                      background: acc.tag,
                      boxShadow: "2px 2px 0 #1a1a1a",
                    }}
                  >
                    <MapPinIcon className="w-5 h-5 text-black" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Lokasi
                    </p>
                    <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                      {event.lokasi}
                    </p>
                  </div>
                </div>

                {/* Jumlah Pendaftar - Full Width */}
                <div className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl text-xl"
                    style={{
                      background: acc.tag,
                      boxShadow: "2px 2px 0 #1a1a1a",
                    }}
                  >
                    👥
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Jumlah Pendaftar
                    </p>
                    <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                      {filled} dari {event.kapasitas} telah mendaftar
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin */}
            {isAdmin && (
              <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{
                    borderBottom: "3px solid #1a1a1a",
                    background: "#fef3c7",
                  }}
                >
                  <div className="w-3 h-6 rounded-sm bg-amber-500" />
                  <h2 className="font-fredoka text-xl font-bold text-amber-900 uppercase tracking-wide">
                    Kontrol Admin{" "}
                  </h2>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="b-btn b-border inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black bg-white text-slate-900 rounded-2xl uppercase tracking-wider"
                  >
                    Edit Event
                  </Link>
                  <Link
                    href={`/events/${event.id}/participants`}
                    className="b-btn b-border inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black text-white rounded-2xl uppercase tracking-wider"
                    style={{ background: acc.btn }}
                  >
                    <UsersIcon className="w-4 h-4" strokeWidth={3} /> Peserta (
                    {filled})
                  </Link>
                </div>
              </div>
            )}

            <div className="block lg:hidden">{renderSidebar()}</div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">{renderSidebar()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isAuthenticated)
    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title={event.nama_event} />
        {pageBody}
      </AuthenticatedLayout>
    );

  return (
    <>
      <Head title={event.nama_event} />
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
          <div
            className="max-w-7xl mx-auto bg-white b-border b-shadow-sm rounded-2xl px-5 sm:px-7 flex items-center justify-between"
            style={{ height: "72px" }}
          >
            <Link href="/events" className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 b-border rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: "#082E4B", boxShadow: "3px 3px 0 #1a1a1a" }}
              >
                <img src="/itfest-logo.png" alt="IT FEST 6.0" className="object-contain w-7 h-7" />
              </div>
              <span className="font-fredoka text-2xl font-bold tracking-tight text-black">
                IT FEST 6.0
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1">{pageBody}</main>
        <footer className="mt-8 py-10 bg-white border-t-4 border-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-10 h-10 b-border rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: "#082E4B", boxShadow: "3px 3px 0 #1a1a1a" }}
              >
                <img src="/itfest-logo.png" alt="IT FEST 6.0" className="object-contain w-7 h-7" />
              </div>
              <span className="font-fredoka text-2xl font-bold tracking-tight text-black">
                IT FEST 6.0
              </span>
            </div>
            <p className="text-slate-400 font-bold text-sm mb-4 max-w-md">
              Diselenggarakan oleh Himpunan Mahasiswa Teknik Informatika dan
              Prodi Teknik Informatika Universitas Paramadina.
            </p>
            <div className="flex items-center gap-4 mb-4">
              <a
                href="https://www.instagram.com/itfest.paramadina"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 transition-colors bg-white rounded-full cursor-pointer text-pink-600 b-border-2 hover:bg-pink-100"
                style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
                title="Instagram IT FEST"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@itfestparamadina"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 transition-colors bg-white rounded-full cursor-pointer text-black b-border-2 hover:bg-gray-100"
                style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
                title="TikTok IT FEST"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest">
              &copy; 2026 IT FEST 6.0 · Himpunan Mahasiswa Teknik Informatika
              &amp; Prodi Teknik Informatika Universitas Paramadina
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
