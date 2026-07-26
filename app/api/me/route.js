export const dynamic = "force-dynamic";

import { getRequester } from "@/lib/auth-role";

export async function GET() {
  const { user, juri, participant } = await getRequester();
  // Halaman publik (/events, /events/[id]) nanya endpoint ini buat cek apakah
  // pengunjung panitia. Guest dijawab 200 role: null — bukan 401 — biar console
  // pengunjung gak penuh error yang sebetulnya bukan kesalahan.
  if (!user) return Response.json({ email: null, role: null, participant: null });

  const role = juri ? "JURI" : participant ? "PESERTA" : "ADMIN";

  return Response.json({
    email: user.email,
    role,
    kategori: juri?.kategori ?? null,
    nama: juri?.nama ?? participant?.nama ?? null,
    // Data peserta buat gate upload + prefill di /submit-karya
    participant: participant
      ? {
          id: participant.id,
          nama: participant.nama,
          namaTim: participant.namaTim,
          email: participant.email,
          paymentStatus: participant.paymentStatus,
          jenisPeserta: participant.jenisPeserta,
          anggota: participant.anggota,
          eventNama: participant.event?.nama_event ?? null,
          // Event gratis → teks status jangan nyebut pembayaran
          isPaidEvent: participant.event?.isPaidEvent ?? false,
          // Lampiran admin — tombolnya baru dibuka setelah peserta diverifikasi
          waGroupLink: participant.event?.waGroupLink ?? null,
          panduanUrl: participant.event?.panduanUrl ?? null,
        }
      : null,
  });
}
