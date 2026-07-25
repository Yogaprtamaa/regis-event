export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";
import { kategoriFromEventName, karyaRequirements } from "@/lib/kategori";

const KARYA_BUCKET = "karya-submissions";

const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\/\S+$/i.test(v.trim());

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
    // File PDF-nya diupload klien langsung ke Supabase (lihat api/submissions/upload-url),
    // yang dikirim ke sini cuma URL hasilnya + link-link.
    const { judulKarya, deskripsi, fileKaryaUrl, fileTurnitinUrl, linkRepo, linkVideo } = await req.json();

    if (!judulKarya || !fileKaryaUrl) {
      return Response.json({ error: "Judul karya & file wajib diisi" }, { status: 400 });
    }

    // Data tim diturunkan dari akun peserta (gak percaya input klien).
    const kategori = kategoriFromEventName(participant.event?.nama_event);
    if (!kategori) {
      return Response.json({ error: "Kategori lomba tidak dikenali" }, { status: 400 });
    }

    // URL file wajib dari bucket kita sendiri — jangan mau nampung link asing.
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${KARYA_BUCKET}/${kategori}/`;
    if (!fileKaryaUrl.startsWith(prefix)) {
      return Response.json({ error: "File karya tidak valid" }, { status: 400 });
    }
    if (fileTurnitinUrl && !fileTurnitinUrl.startsWith(prefix)) {
      return Response.json({ error: "File Turnitin tidak valid" }, { status: 400 });
    }

    const req_ = karyaRequirements(kategori);
    if (req_.fileTurnitin === "required" && !fileTurnitinUrl) {
      return Response.json({ error: "Laporan Turnitin wajib diunggah" }, { status: 400 });
    }
    if (req_.linkRepo === "required" && !isHttpUrl(linkRepo)) {
      return Response.json({ error: "Link repository wajib diisi (http/https)" }, { status: 400 });
    }
    if (req_.linkVideo === "required" && !isHttpUrl(linkVideo)) {
      return Response.json({ error: "Link video demo wajib diisi (http/https)" }, { status: 400 });
    }
    for (const [label, v] of [["repository", linkRepo], ["video demo", linkVideo]]) {
      if (v && !isHttpUrl(v)) {
        return Response.json({ error: `Link ${label} harus diawali http:// atau https://` }, { status: 400 });
      }
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
        fileKaryaUrl,
        fileTurnitinUrl: fileTurnitinUrl || null,
        linkRepo: linkRepo || null,
        linkVideo: linkVideo || null,
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
