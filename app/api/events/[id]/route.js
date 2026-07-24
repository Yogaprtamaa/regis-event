export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return Response.json(
        { error: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json(event);
  } catch (error) {
    console.error('Error fetching event:', error.message);
    return Response.json(
      { error: 'Failed to fetch event', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const event = await prisma.event.update({
      where: { id },
      data: {
        nama_event: body.nama_event,
        deskripsi: body.deskripsi,
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
        jam_mulai: body.jam_mulai,
        jam_berakhir: body.jam_berakhir,
        lokasi: body.lokasi,
        kapasitas: body.kapasitas ? parseInt(body.kapasitas) : null,
        panduanUrl: body.panduanUrl !== undefined ? (body.panduanUrl || null) : undefined,
        waGroupLink: body.waGroupLink !== undefined ? (body.waGroupLink || null) : undefined,
        formSchema: body.formSchema !== undefined ? body.formSchema : undefined,
      },
      include: {
        participants: true,
      },
    });

    return Response.json(event);
  } catch (error) {
    console.error('Error updating event:', error.message);
    return Response.json(
      { error: 'Failed to update event', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    // Delete all participants for this event first
    await prisma.participant.deleteMany({
      where: { eventId: id },
    });
    
    // Then delete the event
    await prisma.event.delete({
      where: { id },
    });

    return Response.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting event:', error.message);
    return Response.json(
      { error: 'Failed to delete event', message: error.message },
      { status: 500 }
    );
  }
}
