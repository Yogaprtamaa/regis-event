export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

/* =======================
   GET → juri: ambil skor yang udah dia isi buat 1 submission (prefill form)
======================= */
export async function GET(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (!juri) return forbidden("Juri only");

  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");
  if (!submissionId) {
    return Response.json({ error: "submissionId wajib diisi" }, { status: 400 });
  }

  try {
    const score = await prisma.score.findUnique({
      where: { submissionId_juriId: { submissionId, juriId: juri.id } },
      include: { items: true },
    });
    return Response.json(score);
  } catch (error) {
    console.error("Error fetching score:", error.message);
    return Response.json(
      { error: "Failed to fetch score", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → juri: simpan/update penilaian 1 submission (semua ScoreItem sekaligus)
======================= */
export async function POST(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (!juri) return forbidden("Juri only");

  try {
    const body = await req.json();
    const { submissionId, catatan, items } = body;
    // items: [{ criteriaId, nilai }]

    if (!submissionId || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "submissionId dan items wajib diisi" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) {
      return Response.json({ error: "Submission tidak ditemukan" }, { status: 404 });
    }
    if (submission.kategori !== juri.kategori) {
      return forbidden("Submission ini bukan kategori Anda");
    }
    if (submission.status !== "LOLOS_SELEKSI") {
      return Response.json(
        { error: "Submission belum lolos seleksi panitia" },
        { status: 400 },
      );
    }
    for (const item of items) {
      if (typeof item.nilai !== "number" || item.nilai < 0 || item.nilai > 100) {
        return Response.json({ error: "Nilai harus angka 0-100" }, { status: 400 });
      }
    }

    const score = await prisma.score.upsert({
      where: { submissionId_juriId: { submissionId, juriId: juri.id } },
      create: {
        submissionId,
        juriId: juri.id,
        catatan: catatan || null,
        items: { create: items.map((i) => ({ criteriaId: i.criteriaId, nilai: i.nilai })) },
      },
      update: {
        catatan: catatan || null,
        items: {
          deleteMany: {},
          create: items.map((i) => ({ criteriaId: i.criteriaId, nilai: i.nilai })),
        },
      },
      include: { items: true },
    });

    return Response.json(score, { status: 201 });
  } catch (error) {
    console.error("Error saving score:", error.message);
    return Response.json(
      { error: "Failed to save score", message: error.message },
      { status: 500 },
    );
  }
}
