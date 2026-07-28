export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, isAdmin, unauthorized, forbidden } from "@/lib/auth-role";

// ponytail: numpang bucket participant-uploads (sudah public) biar gak perlu bikin bucket baru.
const BUCKET = "participant-uploads";
const MAX_BYTES = 10 * 1024 * 1024;

// POST → upload PDF buku panduan lomba, langsung disimpan ke Event.panduanUrl.
export async function POST(req, { params }) {
  try {
    const requester = await getRequester();
    if (!requester.user) return unauthorized();
    if (!isAdmin(requester)) return forbidden();

    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    // Satu buku panduan biasanya berlaku buat semua lomba, jadi panitia bisa
    // pilih sekali upload untuk semua event.
    const semuaEvent = form.get("semuaEvent") === "1";

    if (!file || typeof file === "string") {
      return Response.json({ error: "File panduan wajib diisi" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return Response.json({ error: "Buku panduan harus berformat PDF" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "Ukuran file maksimal 10MB" }, { status: 400 });
    }

    const admin = createAdminClient();
    const path = `panduan/${id}-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "application/pdf" });
    if (uploadError) throw uploadError;

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    if (semuaEvent) {
      await prisma.event.updateMany({ data: { panduanUrl: data.publicUrl } });
    } else {
      await prisma.event.update({ where: { id }, data: { panduanUrl: data.publicUrl } });
    }

    return Response.json({ url: data.publicUrl, semuaEvent });
  } catch (error) {
    console.error("Error upload panduan:", error.message);
    return Response.json({ error: "Gagal upload panduan", message: error.message }, { status: 500 });
  }
}
