export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { kategoriFromEventName } from "@/lib/kategori";

const KARYA_BUCKET = "karya-submissions";
const MAX_KARYA_BYTES = 10 * 1024 * 1024; // 10MB

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
   POST → peserta submit karya (wajib login peserta + sudah terverifikasi)
======================= */
export async function POST(req) {
  const { user, participant } = await getRequester();
  if (!user || !participant) {
    return forbidden("Harus login sebagai peserta");
  }
  if (participant.paymentStatus !== "APPROVED") {
    return forbidden("Akun belum terverifikasi panitia");
  }

  try {
    const formData = await req.formData();

    const judulKarya = formData.get("judulKarya");
    const deskripsi = formData.get("deskripsi");
    const file = formData.get("fileKarya");

    if (!judulKarya || !file) {
      return Response.json({ error: "Judul karya & file wajib diisi" }, { status: 400 });
    }
    if (file.size > MAX_KARYA_BYTES) {
      return Response.json(
        { error: "Ukuran file maksimal 10MB. Kompres dulu file kamu ya." },
        { status: 400 },
      );
    }

    // Data tim diturunkan dari akun peserta (gak percaya input klien).
    const kategori = kategoriFromEventName(participant.event?.nama_event);
    if (!kategori) {
      return Response.json({ error: "Kategori lomba tidak dikenali" }, { status: 400 });
    }
    const anggota = participant.anggota || null;
    const ketua = Array.isArray(anggota) && anggota[0] ? anggota[0] : null;
    const namaTim = participant.nama;
    const ketuaNama = ketua?.nama || participant.nama;
    const ketuaNim = ketua?.nim || participant.nim || null;
    const ketuaEmail = participant.email;

    // Cegah dobel submit untuk peserta yang sama di kategori ini.
    const existing = await prisma.submission.findFirst({
      where: { kategori, ketuaEmail },
    });
    if (existing) {
      return Response.json(
        { error: "Kamu sudah pernah mengumpulkan karya di kategori ini" },
        { status: 400 },
      );
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
