export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

/* =======================
   PATCH → panitia: ubah status seleksi (LOLOS_SELEKSI / TIDAK_LOLOS)
======================= */
export async function PATCH(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { id } = await params;

  try {
    const body = await req.json();
    if (!["SUBMITTED", "LOLOS_SELEKSI", "TIDAK_LOLOS"].includes(body.status)) {
      return Response.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: { status: body.status },
    });

    return Response.json(submission);
  } catch (error) {
    console.error("Error updating submission:", error.message);
    return Response.json(
      { error: "Failed to update submission", message: error.message },
      { status: 500 },
    );
  }
}
