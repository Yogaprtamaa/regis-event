export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import { getPesertaConfig } from "../../../lib/pesertaConfig";
import { getRequester, isAdmin, requireAdmin } from "../../../lib/auth-role";
import { tandatanganiBerkas } from "../../../lib/storage";

export async function GET() {
  try {
    // Sama seperti /api/events/[id]: daftar event terbuka untuk publik, tapi
    // baris peserta dan lampiran panitia cuma buat panitia.
    const { user, juri, participant } = await getRequester();
    const admin = !!user && isAdmin({ juri, participant });

    const events = await prisma.event.findMany({
      include: {
        _count: { select: { participants: true } },
        ...(admin ? { participants: true } : {}),
      },
      orderBy: {
        tanggal: "asc",
      },
    });

    if (admin) return Response.json(await tandatanganiBerkas(events));

    return Response.json(
      await tandatanganiBerkas(events.map(({ waGroupLink, ...publik }) => publik)),
    );
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return Response.json(
      { error: "Failed to fetch events", message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  // Bikin event — panitia saja.
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    const body = await req.json();

    const event = await prisma.event.create({
      data: {
        nama_event: body.nama_event,
        deskripsi: body.deskripsi,
        tanggal: new Date(body.tanggal),
        tanggal_berakhir: body.tanggal_berakhir ? new Date(body.tanggal_berakhir) : null,
        jam_mulai: body.jam_mulai,
        jam_berakhir: body.jam_berakhir,
        lokasi: body.lokasi,
        kapasitas: body.kapasitas,
        isPaidEvent: body.isPaidEvent ?? false,
        // Kolom formulir pendaftaran (form-builder). null → pakai DEFAULT_FORM_SCHEMA.
        formSchema: Array.isArray(body.formSchema) && body.formSchema.length ? body.formSchema : undefined,
        // Pengaturan data peserta (individu/kelompok, batas anggota, kolom NIM)
        pesertaConfig: body.pesertaConfig ? getPesertaConfig({ pesertaConfig: body.pesertaConfig }) : undefined,
      },
      include: {
        participants: true,
      },
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error.message);
    return Response.json(
      { error: "Failed to create event", message: error.message },
      { status: 500 },
    );
  }
}
