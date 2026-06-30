import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

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
        "Kompetisi pengembangan perangkat IoT dan aplikasi terkait, mengaplikasikan pengetahuan teknis ke proyek nyata yang bermanfaat untuk masyarakat. Untuk mahasiswa & siswa SMA/SMK sederajat. Pendaftaran: 27 Juli – 14 Agustus 2026.",
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

  // ── Peserta contoh (Participants) ───────────────────────────────
  console.log("📝 Membuat peserta contoh...");

  const peserta = [
    // Hackathon
    { nama: "Raka Pradana",   email: "raka@student.paramadina.ac.id",  nim: "2210511001", no_wa: "081234500001", jurusan: "Teknik Informatika", angkatan: "2022", status: "terdaftar", role: "PESERTA", eventId: hackathon.id },
    { nama: "Dinda Maharani", email: "dinda@student.paramadina.ac.id", nim: "2210511002", no_wa: "081234500002", jurusan: "Teknik Informatika", angkatan: "2022", status: "terdaftar", role: "PESERTA", eventId: hackathon.id },
    { nama: "Fauzan Akbar",   email: "fauzan@student.paramadina.ac.id",nim: "2210511003", no_wa: "081234500003", jurusan: "Sistem Informasi",   angkatan: "2023", status: "terdaftar", role: "PESERTA", eventId: hackathon.id },

    // IoT (boleh mahasiswa & SMA/SMK)
    { nama: "Bagas Saputra",  email: "bagas@student.paramadina.ac.id", nim: "2210511010", no_wa: "081234500010", jurusan: "Teknik Informatika", angkatan: "2023", status: "terdaftar", role: "PESERTA", eventId: iot.id },
    { nama: "Nadia Putri",    email: "nadia.smk@gmail.com",            nim: null,          no_wa: "081234500011", instansi: "SMKN 1 Jakarta",   status: "terdaftar", role: "PESERTA", eventId: iot.id },

    // Game Making
    { nama: "Yoga Pratama",   email: "yoga@student.paramadina.ac.id",  nim: "2210511020", no_wa: "081234500020", jurusan: "Teknik Informatika", angkatan: "2022", status: "terdaftar", role: "PESERTA", eventId: gameMaking.id },
    { nama: "Salsa Anindya",  email: "salsa@student.paramadina.ac.id", nim: "2210511021", no_wa: "081234500021", jurusan: "Teknik Informatika", angkatan: "2024", status: "terdaftar", role: "PESERTA", eventId: gameMaking.id },

    // KTI
    { nama: "Aditya Nugroho", email: "aditya@student.paramadina.ac.id",nim: "2210511030", no_wa: "081234500030", jurusan: "Sistem Informasi",   angkatan: "2022", status: "terdaftar", role: "PESERTA", eventId: kti.id },
  ];

  for (const p of peserta) {
    await prisma.participant.create({ data: p });
  }
  console.log(`✅ ${peserta.length} peserta contoh dibuat\n`);

  console.log("📊 Ringkasan Seed IT FEST 6.0:");
  console.log("  ✓ 4 Kategori Lomba (Hackathon, IoT, Game Making, KTI)");
  console.log("  ✓ 2 Akun Panitia");
  console.log(`  ✓ ${peserta.length} Peserta contoh\n`);
  console.log("🎉 Seed selesai! Ride the Wave of Creativity 🌊");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
