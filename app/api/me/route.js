export const dynamic = "force-dynamic";

import { getRequester, unauthorized } from "@/lib/auth-role";

export async function GET() {
  const { user, juri, participant } = await getRequester();
  if (!user) return unauthorized();

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
          email: participant.email,
          paymentStatus: participant.paymentStatus,
          jenisPeserta: participant.jenisPeserta,
          anggota: participant.anggota,
          eventNama: participant.event?.nama_event ?? null,
        }
      : null,
  });
}
