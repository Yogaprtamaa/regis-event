export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { rankSubmissions, isAnnounced } from "@/lib/scoring";

// Tanggal pengumuman berlaku serentak, jadi satu simpanan menyentuh semua
// kategori sekaligus. Publish tetap per kategori.
const SEMUA_KATEGORI = ["HACKATHON", "KTI", "IOT"];

/* =======================
   GET → panitia: ranking lengkap 1 kategori (buat direview sebelum publish)
======================= */
export async function GET(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { searchParams } = new URL(req.url);
  const kategori = searchParams.get("kategori");
  if (!kategori) {
    return Response.json({ error: "kategori wajib diisi" }, { status: 400 });
  }

  try {
    const [submissions, criteria, publishState] = await Promise.all([
      prisma.submission.findMany({
        where: { kategori, status: "LOLOS_SELEKSI" },
        include: { scores: { include: { items: true } } },
      }),
      prisma.criteria.findMany({ where: { kategori } }),
      prisma.finalistPublish.findUnique({ where: { kategori } }),
    ]);

    const ranked = rankSubmissions(submissions, criteria).map((s, i) => ({
      rank: i + 1,
      id: s.id,
      namaTim: s.namaTim,
      judulKarya: s.judulKarya,
      totalScore: s.totalScore,
      juriCount: s.juriCount,
      isTop5: i < 5,
    }));

    return Response.json({
      kategori,
      published: publishState?.published ?? false,
      publishedAt: publishState?.publishedAt ?? null,
      announceAt: publishState?.announceAt ?? null,
      // true = udah beneran kebuka ke publik (published + tanggal lewat)
      announced: isAnnounced(publishState),
      ranking: ranked,
    });
  } catch (error) {
    console.error("Error computing ranking:", error.message);
    return Response.json(
      { error: "Failed to compute ranking", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   PATCH → panitia: set tanggal pengumuman untuk SEMUA kategori sekaligus
======================= */
export async function PATCH(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  try {
    const { announceAt } = await req.json();
    const tanggal = announceAt ? new Date(announceAt) : null;
    if (tanggal && Number.isNaN(tanggal.getTime())) {
      return Response.json({ error: "Tanggal pengumuman tidak valid" }, { status: 400 });
    }

    await Promise.all(
      SEMUA_KATEGORI.map((kategori) =>
        prisma.finalistPublish.upsert({
          where: { kategori },
          create: { kategori, published: false, announceAt: tanggal },
          update: { announceAt: tanggal },
        }),
      ),
    );

    return Response.json({ announceAt: tanggal, kategori: SEMUA_KATEGORI });
  } catch (error) {
    console.error("Error setting announce date:", error.message);
    return Response.json(
      { error: "Failed to set announce date", message: error.message },
      { status: 500 },
    );
  }
}
