export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, isAdmin, unauthorized, forbidden } from "@/lib/auth-role";

const BUCKET = "participant-uploads";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req) {
  try {
    const requester = await getRequester();
    if (!requester.user) return unauthorized();
    if (!isAdmin(requester)) return forbidden();

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return Response.json({ error: "File QR wajib diisi" }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return Response.json({ error: "QR harus berupa gambar" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const ext = file.name?.split(".").pop() || "png";
    const path = `bazaar-qr/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || "image/png" });
    if (uploadError) throw uploadError;

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    // disimpan sebagai publicUrl privat -> nanti ditandatangani via tandatanganiBerkas
    return Response.json({ publicUrl: data.publicUrl, path });
  } catch (error) {
    console.error("Error upload bazaar QR:", error.message);
    return Response.json({ error: "Gagal upload QR", message: error.message }, { status: 500 });
  }
}
