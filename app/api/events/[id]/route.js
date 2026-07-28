export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma";
import { getPesertaConfig } from "@/lib/pesertaConfig";
import { getRequester, isAdmin, requireAdmin } from "@/lib/auth-role";
import { tandatanganiBerkas, bentukSimpan } from "@/lib/storage";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Halaman event boleh dibuka siapa saja, jadi baris peserta (email, NIM,
    // no WA, bukti bayar, KTM) serta lampiran panitia cuma dikirim ke panitia.
    // Publik cukup dapat jumlahnya buat hitung sisa kuota.
    const { user, juri, participant } = await getRequester();
    const admin = !!user && isAdmin({ juri, participant });

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: true } },
        ...(admin ? { participants: true } : {}),
      },
    });

    if (!event) {
      return Response.json(
        { error: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    if (admin) return Response.json(await tandatanganiBerkas(event));

    // panduanUrl tetap dibuka buat publik — calon peserta perlu baca sebelum
    // daftar — tapi bucket-nya privat, jadi tetap harus ditandatangani.
    // waGroupLink enggak: grupnya cuma buat yang sudah diverifikasi.
    const { waGroupLink, ...publik } = event;
    return Response.json(await tandatanganiBerkas(publik));
  } catch (error) {
    console.error('Error fetching event:', error.message);
    return Response.json(
      { error: 'Failed to fetch event', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  // Ubah event — panitia saja.
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    const { id } = await params;
    const body = await req.json();

    const event = await prisma.event.update({
      where: { id },
      data: {
        nama_event: body.nama_event,
        deskripsi: body.deskripsi,
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
        tanggal_berakhir: body.tanggal_berakhir !== undefined
          ? (body.tanggal_berakhir ? new Date(body.tanggal_berakhir) : null)
          : undefined,
        jam_mulai: body.jam_mulai,
        jam_berakhir: body.jam_berakhir,
        lokasi: body.lokasi,
        kapasitas: body.kapasitas ? parseInt(body.kapasitas) : null,
        panduanUrl: body.panduanUrl !== undefined ? (bentukSimpan(body.panduanUrl) || null) : undefined,
        waGroupLink: body.waGroupLink !== undefined ? (body.waGroupLink || null) : undefined,
        formSchema: body.formSchema !== undefined ? body.formSchema : undefined,
        pesertaConfig: body.pesertaConfig !== undefined
          ? getPesertaConfig({ pesertaConfig: body.pesertaConfig })
          : undefined,
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
  // Hapus event beserta pesertanya — panitia saja.
  const gate = await requireAdmin();
  if (gate) return gate;

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
