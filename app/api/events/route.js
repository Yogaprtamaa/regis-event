export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: true,
      },
      orderBy: {
        tanggal: "asc",
      },
    });
    return Response.json(events);
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return Response.json(
      { error: "Failed to fetch events", message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const event = await prisma.event.create({
      data: {
        nama_event: body.nama_event,
        deskripsi: body.deskripsi,
        tanggal: new Date(body.tanggal),
        jam_mulai: body.jam_mulai,
        jam_berakhir: body.jam_berakhir,
        lokasi: body.lokasi,
        kapasitas: body.kapasitas,
        isPaidEvent: body.isPaidEvent ?? false,
        // Kolom formulir pendaftaran (form-builder). null → pakai DEFAULT_FORM_SCHEMA.
        formSchema: Array.isArray(body.formSchema) && body.formSchema.length ? body.formSchema : undefined,
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
