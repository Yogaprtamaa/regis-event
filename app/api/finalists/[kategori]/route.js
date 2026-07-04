export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { rankSubmissions } from "@/lib/scoring";

/* =======================
   GET → publik: top 5 finalis, cuma kalau udah di-publish panitia
======================= */
export async function GET(req, { params }) {
  const { kategori } = await params;

  try {
    const publishState = await prisma.finalistPublish.findUnique({ where: { kategori } });
    if (!publishState?.published) {
      return Response.json({ kategori, published: false, finalists: [] });
    }

    const [submissions, criteria] = await Promise.all([
      prisma.submission.findMany({
        where: { kategori, status: "LOLOS_SELEKSI" },
        include: { scores: { include: { items: true } } },
      }),
      prisma.criteria.findMany({ where: { kategori } }),
    ]);

    const top5 = rankSubmissions(submissions, criteria)
      .slice(0, 5)
      .map((s, i) => ({ rank: i + 1, namaTim: s.namaTim, judulKarya: s.judulKarya }));

    return Response.json({
      kategori,
      published: true,
      publishedAt: publishState.publishedAt,
      finalists: top5,
    });
  } catch (error) {
    console.error("Error fetching finalists:", error.message);
    return Response.json(
      { error: "Failed to fetch finalists", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   PATCH → panitia: toggle publish/unpublish finalis kategori ini
======================= */
export async function PATCH(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { kategori } = await params;

  try {
    const body = await req.json();
    const published = Boolean(body.published);

    const state = await prisma.finalistPublish.upsert({
      where: { kategori },
      create: { kategori, published, publishedAt: published ? new Date() : null },
      update: { published, publishedAt: published ? new Date() : null },
    });

    return Response.json(state);
  } catch (error) {
    console.error("Error toggling publish:", error.message);
    return Response.json(
      { error: "Failed to toggle publish", message: error.message },
      { status: 500 },
    );
  }
}
