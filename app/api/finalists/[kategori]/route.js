export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { rankSubmissions, isAnnounced } from "@/lib/scoring";

/* =======================
   GET → publik: top 5 finalis, cuma kalau udah di-publish panitia DAN
   tanggal pengumuman udah lewat. Sebelum itu cuma tanggalnya yang dibalikin.
======================= */
export async function GET(req, { params }) {
  const { kategori } = await params;

  try {
    const publishState = await prisma.finalistPublish.findUnique({ where: { kategori } });
    if (!isAnnounced(publishState)) {
      return Response.json({
        kategori,
        published: false,
        announceAt: publishState?.announceAt ?? null,
        finalists: [],
      });
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
      announceAt: publishState.announceAt,
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
   PATCH → panitia: set tanggal pengumuman dan/atau toggle publish.
   Publish ditolak kalau tanggal pengumuman belum diisi.
======================= */
export async function PATCH(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { kategori } = await params;

  try {
    const body = await req.json();
    const current = await prisma.finalistPublish.findUnique({ where: { kategori } });

    const data = {};
    if ("announceAt" in body) {
      data.announceAt = body.announceAt ? new Date(body.announceAt) : null;
      if (data.announceAt && Number.isNaN(data.announceAt.getTime())) {
        return Response.json({ error: "Tanggal pengumuman tidak valid" }, { status: 400 });
      }
    }
    if ("published" in body) {
      data.published = Boolean(body.published);
      data.publishedAt = data.published ? new Date() : null;
    }

    const announceAt = "announceAt" in data ? data.announceAt : current?.announceAt;
    if (data.published && !announceAt) {
      return Response.json(
        { error: "Set tanggal pengumuman dulu sebelum publish finalis" },
        { status: 400 },
      );
    }

    const state = await prisma.finalistPublish.upsert({
      where: { kategori },
      create: {
        kategori,
        published: data.published ?? false,
        publishedAt: data.publishedAt ?? null,
        announceAt: data.announceAt ?? null,
      },
      update: data,
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
