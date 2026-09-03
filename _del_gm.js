// Hapus data Game Making dari DB. Jalanin: node del_gm.js [--apply]
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const K = "GAME_MAKING";

(async () => {
  const events = await prisma.event.findMany({
    where: { nama_event: { contains: "game making", mode: "insensitive" } },
    select: { id: true, nama_event: true },
  });
  const eventIds = events.map((e) => e.id);

  const [participants, submissions, criteria, juri, finalist] = await Promise.all([
    prisma.participant.count({ where: { eventId: { in: eventIds } } }),
    prisma.submission.count({ where: { kategori: K } }),
    prisma.criteria.count({ where: { kategori: K } }),
    prisma.juri.count({ where: { kategori: K } }),
    prisma.finalistPublish.count({ where: { kategori: K } }),
  ]);

  console.log("=== Game Making di DB ===");
  console.log("Events:", events.map((e) => `${e.nama_event} (${e.id})`).join(", ") || "-");
  console.log("Participants:", participants);
  console.log("Submissions (GAME_MAKING):", submissions);
  console.log("Criteria (GAME_MAKING):", criteria);
  console.log("Juri (GAME_MAKING):", juri);
  console.log("FinalistPublish (GAME_MAKING):", finalist);

  if (!APPLY) {
    console.log("\nDRY RUN. Tambah --apply buat hapus.");
    return;
  }

  // Urutan aman FK. Score/ScoreItem ke-cascade dari Submission/Juri/Criteria.
  const r = {};
  r.submissions = (await prisma.submission.deleteMany({ where: { kategori: K } })).count;
  r.juri = (await prisma.juri.deleteMany({ where: { kategori: K } })).count;
  r.criteria = (await prisma.criteria.deleteMany({ where: { kategori: K } })).count;
  r.finalist = (await prisma.finalistPublish.deleteMany({ where: { kategori: K } })).count;
  if (eventIds.length) {
    r.participants = (await prisma.participant.deleteMany({ where: { eventId: { in: eventIds } } })).count;
    r.events = (await prisma.event.deleteMany({ where: { id: { in: eventIds } } })).count;
  }
  console.log("\n=== DIHAPUS ===");
  console.log(r);
})()
  .catch((e) => { console.error("ERROR:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
