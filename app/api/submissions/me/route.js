export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { kategoriFromEventName } from "@/lib/kategori";
import { rankSubmissions } from "@/lib/scoring";

/* =======================
   GET → peserta: status karya sendiri + hasil (nilai/rank) kalau kategori
   udah di-publish panitia. Nilai/rank sengaja ditahan sebelum publish biar
   gak bocor keputusan juri duluan — status seleksi berkas tetap kelihatan.
======================= */
export async function GET() {
  const { user, participant } = await getRequester();
  if (!user) return unauthorized();
  if (!participant) return forbidden("Harus login sebagai peserta");

  const kategori = kategoriFromEventName(participant.event?.nama_event);
  if (!kategori) {
    return Response.json({ hasSubmission: false });
  }

  try {
    const submission = await prisma.submission.findFirst({
      where: { kategori, ketuaEmail: participant.email },
    });

    if (!submission) {
      return Response.json({ hasSubmission: false });
    }

    const base = {
      hasSubmission: true,
      judulKarya: submission.judulKarya,
      fileKaryaUrl: submission.fileKaryaUrl,
      fileTurnitinUrl: submission.fileTurnitinUrl,
      linkRepo: submission.linkRepo,
      linkVideo: submission.linkVideo,
      status: submission.status,
      createdAt: submission.createdAt,
      published: false,
    };

    const publishState = await prisma.finalistPublish.findUnique({ where: { kategori } });
    if (!publishState?.published) {
      return Response.json(base);
    }

    // Publish udah aktif → hitung ranking kategori ini, cari posisi karya ini.
    const [submissions, criteria] = await Promise.all([
      prisma.submission.findMany({
        where: { kategori, status: "LOLOS_SELEKSI" },
        include: { scores: { include: { items: true } } },
      }),
      prisma.criteria.findMany({ where: { kategori } }),
    ]);

    const ranked = rankSubmissions(submissions, criteria);
    const mine = ranked.findIndex((s) => s.id === submission.id);

    return Response.json({
      ...base,
      published: true,
      publishedAt: publishState.publishedAt,
      rank: mine === -1 ? null : mine + 1,
      avgScore: mine === -1 ? null : ranked[mine].avgScore,
      isTop5: mine !== -1 && mine < 5,
    });
  } catch (error) {
    console.error("Error fetching my submission:", error.message);
    return Response.json(
      { error: "Failed to fetch submission", message: error.message },
      { status: 500 },
    );
  }
}
