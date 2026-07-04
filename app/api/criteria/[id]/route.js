export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getRequester, unauthorized, forbidden } from "@/lib/auth-role";

export async function PUT(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { id } = await params;

  try {
    const body = await req.json();
    const criteria = await prisma.criteria.update({
      where: { id },
      data: {
        ...(body.nama != null ? { nama: body.nama } : {}),
        ...(body.bobot != null ? { bobot: Number(body.bobot) } : {}),
      },
    });
    return Response.json(criteria);
  } catch (error) {
    console.error("Error updating criteria:", error.message);
    return Response.json(
      { error: "Failed to update criteria", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const { user, juri } = await getRequester();
  if (!user) return unauthorized();
  if (juri) return forbidden("Admin only");

  const { id } = await params;

  try {
    await prisma.criteria.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting criteria:", error.message);
    return Response.json(
      { error: "Failed to delete criteria", message: error.message },
      { status: 500 },
    );
  }
}
