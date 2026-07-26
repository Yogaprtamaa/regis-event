import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Role ditentukan dari baris yang ke-link ke auth user id:
//   - juri       → ada baris Juri (supabaseId = auth id)
//   - peserta    → ada baris Participant (supabaseId = auth id)
//   - panitia    → user Supabase yang bukan juri & bukan peserta (default lama)
export async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, juri: null, participant: null };

  const [juri, participant] = await Promise.all([
    prisma.juri.findUnique({ where: { supabaseId: user.id } }),
    prisma.participant.findFirst({
      where: { supabaseId: user.id },
      include: { event: true },
    }),
  ]);

  return { user, juri, participant };
}

// Panitia = login tapi bukan juri & bukan peserta.
export function isAdmin({ juri, participant }) {
  return !juri && !participant;
}

// Gerbang route panitia. Middleware cuma baca app_metadata.role dari JWT, dan
// akun juri gak punya penanda itu — jadi juri lolos ke API panitia kalau
// route-nya cuma ngandelin middleware. Route wajib manggil ini sendiri.
// Balikin null kalau boleh lanjut, atau Response yang tinggal di-return.
export async function requireAdmin() {
  const requester = await getRequester();
  if (!requester.user) return unauthorized();
  if (!isAdmin(requester)) return forbidden("Panitia only");
  return null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}
