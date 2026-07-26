export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { kategoriFromEventName } from "@/lib/kategori";
import { rankSubmissions, isAnnounced } from "@/lib/scoring";
import { tandatanganiBerkas } from "@/lib/storage";

/* =======================
   GET → peserta: status karya sendiri + hasil (nilai/rank) kalau kategori
   udah di-publish panitia DAN tanggal pengumuman lewat. Nilai/rank sengaja
   ditahan sebelum itu biar gak bocor keputusan juri duluan — status seleksi
   berkas tetap kelihatan.
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

    const publishState = await prisma.finalistPublish.findUnique({ where: { kategori } });

    // Bucket privat — berkas dikirim sebagai URL bertanda tangan.
    const berkas = await tandatanganiBerkas({
      fileKaryaUrl: submission.fileKaryaUrl,
      fileTurnitinUrl: submission.fileTurnitinUrl,
    });

    const base = {
      hasSubmission: true,
      judulKarya: submission.judulKarya,
      fileKaryaUrl: berkas.fileKaryaUrl,
      fileTurnitinUrl: berkas.fileTurnitinUrl,
      linkRepo: submission.linkRepo,
      linkVideo: submission.linkVideo,
      status: submission.status,
      createdAt: submission.createdAt,
      published: false,
      announceAt: publishState?.announceAt ?? null,
    };

    if (!isAnnounced(publishState)) {
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
      totalScore: mine === -1 ? null : ranked[mine].totalScore,
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
