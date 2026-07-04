export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

/* =======================
   GET → kriteria per kategori (panitia lihat semua, juri cuma kategori-nya)
======================= */
export async function GET(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const kategori = searchParams.get("kategori");

  if (juri && kategori && kategori !== juri.kategori) {
    return forbidden("Bukan kategori Anda");
  }
  if (juri && !kategori) {
    // juri tanpa filter: batasi otomatis ke kategorinya sendiri
    const data = await prisma.criteria.findMany({
      where: { kategori: juri.kategori },
      orderBy: { createdAt: "asc" },
    });
    return Response.json(data);
  }

  try {
    const data = await prisma.criteria.findMany({
      where: kategori ? { kategori } : {},
      orderBy: { createdAt: "asc" },
    });
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching criteria:", error.message);
    return Response.json(
      { error: "Failed to fetch criteria", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → panitia bikin kriteria baru
======================= */
export async function POST(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  try {
    const body = await req.json();
    if (!body.kategori || !body.nama || body.bobot == null) {
      return Response.json({ error: "kategori, nama, dan bobot wajib diisi" }, { status: 400 });
    }

    const criteria = await prisma.criteria.create({
      data: {
        kategori: body.kategori,
        nama: body.nama,
        bobot: Number(body.bobot),
      },
    });

    return Response.json(criteria, { status: 201 });
  } catch (error) {
    console.error("Error creating criteria:", error.message);
    return Response.json(
      { error: "Failed to create criteria", message: error.message },
      { status: 500 },
    );
  }
}
