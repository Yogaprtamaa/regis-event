export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

/* =======================
   DELETE → panitia cabut akses juri (hapus role + akun Supabase-nya)
======================= */
export async function DELETE(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { id } = await params;

  try {
    const target = await prisma.juri.findUnique({ where: { id } });
    if (!target) return Response.json({ error: "Juri tidak ditemukan" }, { status: 404 });

    await prisma.juri.delete({ where: { id } });

    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(target.supabaseId).catch((err) => {
      console.error("Gagal hapus akun Supabase juri (role sudah dicabut):", err.message);
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting juri:", error.message);
    return Response.json(
      { error: "Failed to delete juri", message: error.message },
      { status: 500 },
    );
  }
}
