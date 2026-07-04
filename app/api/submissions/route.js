export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

const KARYA_BUCKET = "karya-submissions";

/* =======================
   GET → panitia: list semua submission (filter kategori/status bebas)
        juri: cuma submission LOLOS_SELEKSI di kategorinya sendiri
======================= */
export async function GET(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const kategori = searchParams.get("kategori");
  const status = searchParams.get("status");

  if (juri && kategori && kategori !== juri.kategori) {
    return forbidden("Bukan kategori Anda");
  }

  try {
    const data = await prisma.submission.findMany({
      where: juri
        ? { kategori: juri.kategori, status: "LOLOS_SELEKSI" }
        : {
            ...(kategori ? { kategori } : {}),
            ...(status ? { status } : {}),
          },
      include: { scores: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    return Response.json(
      { error: "Failed to fetch submissions", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → peserta submit karya (publik, gak butuh login)
======================= */
export async function POST(req) {
  try {
    const formData = await req.formData();

    const kategori = formData.get("kategori");
    const namaTim = formData.get("namaTim");
    const ketuaNama = formData.get("ketuaNama");
    const ketuaNim = formData.get("ketuaNim");
    const ketuaEmail = formData.get("ketuaEmail");
    const judulKarya = formData.get("judulKarya");
    const deskripsi = formData.get("deskripsi");
    const anggotaRaw = formData.get("anggota");
    const file = formData.get("fileKarya");

    if (!kategori || !namaTim || !ketuaNama || !ketuaEmail || !judulKarya || !file) {
      return Response.json({ error: "Ada field wajib yang belum diisi" }, { status: 400 });
    }

    let anggota = null;
    try {
      anggota = anggotaRaw ? JSON.parse(anggotaRaw) : null;
    } catch {
      anggota = null;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name?.split(".").pop() || "bin";
    const path = `${kategori}/karya-${Date.now()}-${Math.round(Math.random() * 1e4)}.${ext}`;

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(KARYA_BUCKET)
      .upload(path, buffer, { contentType: file.type || "application/octet-stream" });

    if (uploadError) {
      return Response.json(
        { error: "Gagal mengunggah file karya", message: uploadError.message },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = admin.storage.from(KARYA_BUCKET).getPublicUrl(path);

    const submission = await prisma.submission.create({
      data: {
        kategori,
        namaTim,
        ketuaNama,
        ketuaNim: ketuaNim || null,
        ketuaEmail,
        anggota,
        judulKarya,
        deskripsi: deskripsi || null,
        fileKaryaUrl: publicUrlData.publicUrl,
      },
    });

    return Response.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error.message);
    return Response.json(
      { error: "Failed to create submission", message: error.message },
      { status: 500 },
    );
  }
}
