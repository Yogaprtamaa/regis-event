import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ponytail: password fix buat semua akun juri seed — cuma buat testing lokal, ganti kalau dipakai beneran
const JURI_PASSWORD = "Juri12345!";

// ponytail: pakai fetch native ke Supabase Auth Admin REST API langsung, bukan @supabase/supabase-js —
// SDK-nya bikin RealtimeClient yang butuh native WebSocket (baru ada di Node 22+), Node 20 masih dipakai di sini
function supabaseAdminHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

// Bikin akun Supabase kalau belum ada, atau pakai yang udah ada (biar seed bisa diulang)
async function getOrCreateSupabaseUser(email, password) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const created = await fetch(`${base}/auth/v1/admin/users`, {
    method: "POST",
    headers: supabaseAdminHeaders(),
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const createdData = await created.json();
  if (created.ok) return createdData;

  const list = await fetch(`${base}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: supabaseAdminHeaders(),
  });
  const listData = await list.json();
  const existing = listData.users?.find((u) => u.email === email);
  if (!existing) throw new Error(createdData.msg || createdData.error_description || "Gagal bikin akun juri");
  return existing;
}

/*
 * IT FEST 6.0 — HIMTI & Prodi Teknik Informatika Universitas Paramadina
 * Tema: "Human-Centered AI: Transforming the World with Integrity"
 * Periode acara: 27 Juli – 14 Oktober 2026
 * Lokasi: Paramadina University, Cipayung, Jakarta
 *
 * "Event" pada sistem ini = kategori lomba yang dibuka pendaftarannya.
 * Pendaftaran lomba: 27 Juli – 14 Agustus 2026 (semua kategori).
 */

const LOKASI = "Universitas Paramadina, Cipayung, Jakarta";

async function main() {
  console.log("🌱 Menyemai data IT FEST 6.0...\n");

  // Bersihkan data lama
  await prisma.scoreItem.deleteMany();
  await prisma.score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.juri.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Data lama dibersihkan\n");

  // ── Lomba (Events) ──────────────────────────────────────────────
  console.log("🏆 Membuat kategori lomba...");

  const hackathon = await prisma.event.create({
    data: {
      nama_event: "Hackathon",
      deskripsi:
        "Ajang kolaborasi & inovasi pemrograman. Peserta menyelesaikan tantangan teknologi dalam waktu terbatas untuk mengasah problem-solving dan kerja tim. Untuk mahasiswa. Pendaftaran: 27 Juli – 14 Agustus 2026.",
      tanggal: new Date("2026-07-27"),
      jam_mulai: "08:00",
      jam_berakhir: "17:00",
      lokasi: LOKASI,
      kapasitas: 30,
      isPaidEvent: false,
    },
  });

  const iot = await prisma.event.create({
    data: {
      nama_event: "Internet of Things (IoT)",
      deskripsi:
        "Kompetisi pengembangan perangkat IoT dan aplikasi terkait, mengaplikasikan pengetahuan teknis ke proyek nyata yang bermanfaat untuk masyarakat. Khusus untuk mahasiswa. Pendaftaran: 27 Juli – 14 Agustus 2026.",
      tanggal: new Date("2026-07-27"),
      jam_mulai: "08:00",
      jam_berakhir: "17:00",
      lokasi: LOKASI,
      kapasitas: 40,
      isPaidEvent: false,
    },
  });

  const gameMaking = await prisma.event.create({
    data: {
      nama_event: "Game Making",
      deskripsi:
        "Ditujukan bagi mahasiswa yang memiliki minat dan bakat dalam pengembangan game digital. Kompetisi ini memberikan platform untuk menunjukkan kreativitas dan keterampilan pemrograman dalam menciptakan permainan yang inovatif dan menarik. Pendaftaran: 27 Juli – 14 Agustus 2026.",
      tanggal: new Date("2026-07-27"),
      jam_mulai: "08:00",
      jam_berakhir: "17:00",
      lokasi: LOKASI,
      kapasitas: 40,
      isPaidEvent: false,
    },
  });

  const kti = await prisma.event.create({
    data: {
      nama_event: "Karya Tulis Ilmiah (KTI)",
      deskripsi:
        "Platform riset bagi mahasiswa yang berminat di bidang teknologi informasi, mengembangkan keterampilan akademis dan menyampaikan solusi inovatif untuk masalah aktual di masyarakat. Untuk mahasiswa. Pendaftaran: 27 Juli – 14 Agustus 2026.",
      tanggal: new Date("2026-07-27"),
      jam_mulai: "08:00",
      jam_berakhir: "17:00",
      lokasi: LOKASI,
      kapasitas: 50,
      isPaidEvent: false,
    },
  });

  console.log("✅ 4 kategori lomba dibuat\n");

  // ── Panitia (Users) ─────────────────────────────────────────────
  console.log("👤 Membuat akun panitia...");
  await prisma.user.create({
    data: {
      nama: "Ayu (Narahubung)",
      email: "itfestparamadina@gmail.com",
      nim: "ITF-ADMIN-01",
      wa: "081992855778",
      status: "active",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
    },
  });
  await prisma.user.create({
    data: {
      nama: "Panitia IT FEST 6.0",
      email: "panitia@itfest.paramadina.ac.id",
      nim: "ITF-ADMIN-02",
      wa: "081200000000",
      status: "active",
      jurusan: "Teknik Informatika",
      angkatan: "2022",
    },
  });
  console.log("✅ Akun panitia dibuat\n");

  // ── Tim peserta contoh (Participants) — 2 tim per lomba ─────────
  console.log("📝 Membuat tim peserta contoh...");

  const kampus = { universitas: "Universitas Paramadina", fakultas: "Fakultas Teknologi Informasi", kotaDomisili: "Jakarta", provinsi: "DKI Jakarta" };

  const peserta = [
    // Hackathon
    { nama: "Raka Pradana", email: "raka@student.paramadina.ac.id", nim: "2210511001", no_wa: "081234500001", jurusan: "Teknik Informatika", angkatan: "2022", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Raka Pradana", nim: "2210511001" }, { nama: "Dinda Maharani", nim: "2210511002" }, { nama: "Fauzan Akbar", nim: "2210511003" }], eventId: hackathon.id },
    { nama: "Bimo Satrio", email: "bimo@student.paramadina.ac.id", nim: "2210511004", no_wa: "081234500004", jurusan: "Teknik Informatika", angkatan: "2023", status: "hadir", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Bimo Satrio", nim: "2210511004" }, { nama: "Citra Dewi", nim: "2210511005" }], eventId: hackathon.id },

    // IoT
    { nama: "Bagas Saputra", email: "bagas@student.paramadina.ac.id", nim: "2210511010", no_wa: "081234500010", jurusan: "Teknik Informatika", angkatan: "2023", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Bagas Saputra", nim: "2210511010" }, { nama: "Nadia Putri", nim: "2210511011" }], eventId: iot.id },
    { nama: "Wisnu Aji", email: "wisnu@student.paramadina.ac.id", nim: "2210511012", no_wa: "081234500012", jurusan: "Sistem Informasi", angkatan: "2022", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Wisnu Aji", nim: "2210511012" }, { nama: "Putri Amelia", nim: "2210511013" }, { nama: "Rangga Wijaya", nim: "2210511014" }], eventId: iot.id },

    // Game Making
    { nama: "Yoga Pratama", email: "yoga@student.paramadina.ac.id", nim: "2210511020", no_wa: "081234500020", jurusan: "Teknik Informatika", angkatan: "2022", status: "hadir", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Yoga Pratama", nim: "2210511020" }, { nama: "Salsa Anindya", nim: "2210511021" }], eventId: gameMaking.id },
    { nama: "Fikri Ramadhan", email: "fikri@student.paramadina.ac.id", nim: "2210511022", no_wa: "081234500022", jurusan: "Teknik Informatika", angkatan: "2024", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Fikri Ramadhan", nim: "2210511022" }, { nama: "Keisha Amara", nim: "2210511023" }], eventId: gameMaking.id },

    // KTI
    { nama: "Aditya Nugroho", email: "aditya@student.paramadina.ac.id", nim: "2210511030", no_wa: "081234500030", jurusan: "Sistem Informasi", angkatan: "2022", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Aditya Nugroho", nim: "2210511030" }, { nama: "Salsabila Rahma", nim: "2210511031" }], eventId: kti.id },
    { nama: "Ilham Maulana", email: "ilham@student.paramadina.ac.id", nim: "2210511032", no_wa: "081234500032", jurusan: "Sistem Informasi", angkatan: "2023", status: "terdaftar", role: "PESERTA", jenisPeserta: "kelompok", ...kampus, anggota: [{ nama: "Ilham Maulana", nim: "2210511032" }, { nama: "Naila Zahra", nim: "2210511033" }, { nama: "Reza Firmansyah", nim: "2210511034" }], eventId: kti.id },
  ];

  for (const p of peserta) {
    await prisma.participant.create({ data: p });
  }
  console.log(`✅ ${peserta.length} tim peserta contoh dibuat (2 tim x 4 lomba)\n`);

  // ── Kriteria penilaian per kategori ─────────────────────────────
  console.log("📏 Membuat kriteria penilaian...");

  const kriteriaList = [
    { kategori: "HACKATHON", nama: "Inovasi & Kreativitas", bobot: 30 },
    { kategori: "HACKATHON", nama: "Fungsionalitas & Implementasi", bobot: 40 },
    { kategori: "HACKATHON", nama: "Presentasi & Business Value", bobot: 30 },

    { kategori: "IOT", nama: "Inovasi & Kreativitas", bobot: 25 },
    { kategori: "IOT", nama: "Fungsionalitas Perangkat", bobot: 45 },
    { kategori: "IOT", nama: "Presentasi & Manfaat", bobot: 30 },

    { kategori: "GAME_MAKING", nama: "Kreativitas & Konsep", bobot: 30 },
    { kategori: "GAME_MAKING", nama: "Gameplay & Teknis", bobot: 40 },
    { kategori: "GAME_MAKING", nama: "Presentasi & Visual", bobot: 30 },

    { kategori: "KTI", nama: "Orisinalitas & Relevansi", bobot: 30 },
    { kategori: "KTI", nama: "Metodologi & Analisis", bobot: 40 },
    { kategori: "KTI", nama: "Penulisan & Presentasi", bobot: 30 },
  ];

  for (const k of kriteriaList) {
    await prisma.criteria.create({ data: k });
  }
  console.log(`✅ ${kriteriaList.length} kriteria dibuat (4 kategori)\n`);

  // ── Akun juri (Supabase auth + role di DB) ──────────────────────
  console.log("⚖️  Membuat akun juri...");

  const juriList = [
    { nama: "Juri Hackathon", email: "juri.hackathon@itfest.test", kategori: "HACKATHON" },
    { nama: "Juri IoT", email: "juri.iot@itfest.test", kategori: "IOT" },
    { nama: "Juri Game Making", email: "juri.game@itfest.test", kategori: "GAME_MAKING" },
    { nama: "Juri KTI", email: "juri.kti@itfest.test", kategori: "KTI" },
  ];

  for (const j of juriList) {
    const supabaseUser = await getOrCreateSupabaseUser(j.email, JURI_PASSWORD);
    await prisma.juri.create({
      data: {
        supabaseId: supabaseUser.id,
        nama: j.nama,
        email: j.email,
        kategori: j.kategori,
      },
    });
  }
  console.log(`✅ ${juriList.length} akun juri dibuat (password: ${JURI_PASSWORD})\n`);

  // ── Submission contoh (karya sudah "diupload") ──────────────────
  console.log("📄 Membuat submission contoh...");

  // ponytail: fileKaryaUrl dummy, bukan file asli — buat testing alur nilai juri aja
  const submissionList = [
    { kategori: "KTI", namaTim: "Tim Nusantara Digital", ketuaNama: "Aditya Nugroho", ketuaEmail: "aditya@student.paramadina.ac.id", judulKarya: "Optimalisasi AI untuk Deteksi Dini Stunting Berbasis Citra", deskripsi: "Riset penerapan computer vision untuk skrining gizi anak.", fileKaryaUrl: "https://example.com/dummy/kti-1.pdf", status: "LOLOS_SELEKSI" },
    { kategori: "KTI", namaTim: "Tim Cipta Wacana", ketuaNama: "Salsabila Rahma", ketuaEmail: "salsabila@student.paramadina.ac.id", judulKarya: "Human-Centered AI dalam Mitigasi Bencana Berbasis Komunitas", deskripsi: "Kajian integritas data partisipatif untuk sistem peringatan dini.", fileKaryaUrl: "https://example.com/dummy/kti-2.pdf", status: "LOLOS_SELEKSI" },
    { kategori: "KTI", namaTim: "Tim Wredha Karsa", ketuaNama: "Ilham Maulana", ketuaEmail: "ilham@student.paramadina.ac.id", judulKarya: "Etika AI dalam Transformasi Layanan Publik", deskripsi: "Belum lolos seleksi, buat tes filter status.", fileKaryaUrl: "https://example.com/dummy/kti-3.pdf", status: "SUBMITTED" },

    { kategori: "HACKATHON", namaTim: "Tim Byte Force", ketuaNama: "Raka Pradana", ketuaEmail: "raka@student.paramadina.ac.id", judulKarya: "SIGAP — Platform Koordinasi Bencana Real-time", deskripsi: "Aplikasi koordinasi relawan berbasis peta interaktif.", fileKaryaUrl: "https://example.com/dummy/hackathon-1.zip", status: "LOLOS_SELEKSI" },
    { kategori: "IOT", namaTim: "Tim Sensora", ketuaNama: "Bagas Saputra", ketuaEmail: "bagas@student.paramadina.ac.id", judulKarya: "Smart Irrigation — Monitoring Kelembaban Tanah IoT", deskripsi: "Sistem irigasi otomatis berbasis sensor kelembaban.", fileKaryaUrl: "https://example.com/dummy/iot-1.zip", status: "LOLOS_SELEKSI" },
    { kategori: "GAME_MAKING", namaTim: "Tim Piksel Nusantara", ketuaNama: "Yoga Pratama", ketuaEmail: "yoga@student.paramadina.ac.id", judulKarya: "Rimba Legenda — Game Edukasi Budaya Nusantara", deskripsi: "Game petualangan 2D bertema cerita rakyat.", fileKaryaUrl: "https://example.com/dummy/game-1.zip", status: "LOLOS_SELEKSI" },
  ];

  for (const s of submissionList) {
    await prisma.submission.create({ data: s });
  }
  console.log(`✅ ${submissionList.length} submission dibuat (3 KTI + 1 lainnya per kategori)\n`);

  console.log("📊 Ringkasan Seed IT FEST 6.0:");
  console.log("  ✓ 4 Kategori Lomba (Hackathon, IoT, Game Making, KTI)");
  console.log("  ✓ 2 Akun Panitia");
  console.log(`  ✓ ${peserta.length} Peserta contoh`);
  console.log(`  ✓ ${kriteriaList.length} Kriteria penilaian`);
  console.log(`  ✓ ${juriList.length} Akun juri (login: <email juri> / ${JURI_PASSWORD})`);
  console.log(`  ✓ ${submissionList.length} Submission contoh (buat tes flow nilai juri)\n`);
  console.log("🎉 Seed IT FEST 6.0 selesai! 🌊");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
