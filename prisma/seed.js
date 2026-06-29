import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.participant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data\n");

  // Create Events
  console.log("📅 Creating events...");
  const event1 = await prisma.event.create({
    data: {
      nama_event: "Workshop Next.js Advanced",
      deskripsi: "Pembelajaran mendalam tentang Next.js 15 dengan App Router, Server Components, dan Optimization",
      tanggal: new Date("2026-03-15"),
      jam_mulai: "14:00",
      jam_berakhir: "17:00",
      lokasi: "Ruang Lab A - Gedung IT HIMTI",
      kapasitas: 50,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      nama_event: "Bootcamp React Fundamentals",
      deskripsi: "Memulai perjalanan React dari dasar hingga advanced dengan hooks dan state management",
      tanggal: new Date("2026-03-22"),
      jam_mulai: "10:00",
      jam_berakhir: "13:00",
      lokasi: "Aula Utama - Gedung IT HIMTI",
      kapasitas: 100,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      nama_event: "Web Development Masterclass",
      deskripsi: "Full-stack web development dengan modern tools dan best practices",
      tanggal: new Date("2026-03-29"),
      jam_mulai: "13:00",
      jam_berakhir: "16:00",
      lokasi: "Ruang Lab B - Gedung IT HIMTI",
      kapasitas: 40,
    },
  });

  console.log("✅ Created 3 events\n");

  // Create Users
  console.log("👤 Creating users...");
  const user1 = await prisma.user.create({
    data: {
      nama: "Ilham Saputra",
      email: "ilham@himti.com",
      nim: "12345001",
      wa: "085712345001",
      status: "active",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      nama: "Rina Ayu Pratiwi",
      email: "rina@himti.com",
      nim: "12345002",
      wa: "085712345002",
      status: "active",
      jurusan: "Sistem Informasi",
      angkatan: "2023",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      nama: "Budi Santoso",
      email: "budi@himti.com",
      nim: "12345003",
      wa: "085712345003",
      status: "active",
      jurusan: "Teknik Informatika",
      angkatan: "2024",
    },
  });

  const user4 = await prisma.user.create({
    data: {
      nama: "Siti Nurhaliza",
      email: "siti@himti.com",
      nim: "12345004",
      wa: "085712345004",
      status: "active",
      jurusan: "Sistem Informasi",
      angkatan: "2024",
    },
  });

  const user5 = await prisma.user.create({
    data: {
      nama: "Ahmad Wijaya",
      email: "ahmad@himti.com",
      nim: "12345005",
      wa: "085712345005",
      status: "active",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
    },
  });

  console.log("✅ Created 5 users\n");

  // Create Participants
  console.log("📝 Creating participants...");

  // Event 1 Participants
  const p1 = await prisma.participant.create({
    data: {
      nama: "Ilham Saputra",
      email: "ilham@himti.com",
      nim: "12345001",
      no_wa: "085712345001",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
      status: "hadir",
      role: "PESERTA",
      eventId: event1.id,
    },
  });

  const p2 = await prisma.participant.create({
    data: {
      nama: "Budi Santoso",
      email: "budi@himti.com",
      nim: "12345003",
      no_wa: "085712345003",
      jurusan: "Teknik Informatika",
      angkatan: "2024",
      status: "hadir",
      role: "PESERTA",
      eventId: event1.id,
    },
  });

  const p3 = await prisma.participant.create({
    data: {
      nama: "Ahmad Wijaya",
      email: "ahmad@himti.com",
      nim: "12345005",
      no_wa: "085712345005",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
      status: "terdaftar",
      role: "PANITIA",
      eventId: event1.id,
    },
  });

  // Event 2 Participants
  const p4 = await prisma.participant.create({
    data: {
      nama: "Rina Ayu Pratiwi",
      email: "rina@himti.com",
      nim: "12345002",
      no_wa: "085712345002",
      jurusan: "Sistem Informasi",
      angkatan: "2023",
      status: "terdaftar",
      role: "DOSEN",
      eventId: event2.id,
    },
  });

  const p5 = await prisma.participant.create({
    data: {
      nama: "Siti Nurhaliza",
      email: "siti@himti.com",
      nim: "12345004",
      no_wa: "085712345004",
      jurusan: "Sistem Informasi",
      angkatan: "2024",
      status: "hadir",
      role: "PESERTA",
      eventId: event2.id,
    },
  });

  const p6 = await prisma.participant.create({
    data: {
      nama: "Ilham Saputra",
      email: "ilham@himti.com",
      nim: "12345001",
      no_wa: "085712345001",
      jurusan: "Teknik Informatika",
      angkatan: "2023",
      status: "terdaftar",
      role: "PESERTA",
      eventId: event2.id,
    },
  });

  // Event 3 Participants
  const p7 = await prisma.participant.create({
    data: {
      nama: "Budi Santoso",
      email: "budi@himti.com",
      nim: "12345003",
      no_wa: "085712345003",
      jurusan: "Teknik Informatika",
      angkatan: "2024",
      status: "hadir",
      role: "PANITIA",
      eventId: event3.id,
    },
  });

  console.log("✅ Created 7 participants\n");

  console.log("📊 Database Seed Summary:");
  console.log("  ✓ 3 Events");
  console.log("  ✓ 5 Users");
  console.log("  ✓ 7 Participants\n");
  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
