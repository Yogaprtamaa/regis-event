export const dynamic = "force-dynamic";

import { getRequester, unauthorized } from "@/lib/auth-role";

export async function GET() {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();

  return Response.json({
    email: user.email,
    role: juri ? "JURI" : "ADMIN",
    kategori: juri?.kategori ?? null,
    nama: juri?.nama ?? null,
  });
}
