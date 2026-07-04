export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

/* =======================
   GET → panitia: list akun juri
======================= */
export async function GET() {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  try {
    const data = await prisma.juri.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching juri:", error.message);
    return Response.json(
      { error: "Failed to fetch juri", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → panitia undang juri baru (bikin akun Supabase + role di DB)
======================= */
export async function POST(req) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  try {
    const body = await req.json();
    if (!body.email || !body.nama || !body.kategori) {
      return Response.json({ error: "email, nama, dan kategori wajib diisi" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      body.email,
    );

    if (inviteError) {
      return Response.json(
        { error: "Gagal mengundang juri", message: inviteError.message },
        { status: 400 },
      );
    }

    const newJuri = await prisma.juri.create({
      data: {
        supabaseId: invited.user.id,
        nama: body.nama,
        email: body.email,
        kategori: body.kategori,
      },
    });

    return Response.json(newJuri, { status: 201 });
  } catch (error) {
    console.error("Error creating juri:", error.message);
    return Response.json(
      { error: "Failed to create juri", message: error.message },
      { status: 500 },
    );
  }
}
