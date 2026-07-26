export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRequester, forbidden } from "@/lib/auth-role";
import { kategoriFromEventName, karyaRequirements } from "@/lib/kategori";

const KARYA_BUCKET = "karya-submissions";

// POST → signed upload URL buat peserta upload PDF langsung ke Supabase.
// File karya bisa puluhan MB, lewat route handler kena limit body Vercel.
export async function POST(req) {
  const { user, participant } = await getRequester();
  if (!user || !participant) return forbidden("Harus login sebagai peserta");
  if (participant.paymentStatus !== "APPROVED") {
    return forbidden("Akun belum terverifikasi panitia");
  }

  const kategori = kategoriFromEventName(participant.event?.nama_event);
  if (!kategori) {
    return Response.json({ error: "Kategori lomba tidak dikenali" }, { status: 400 });
  }
  // Kategori non-KTI ngumpulin lewat link Drive — gak boleh nitip file di bucket.
  if (karyaRequirements(kategori).fileKarya !== "upload") {
    return Response.json(
      { error: "Kategori ini mengumpulkan karya lewat link Google Drive" },
      { status: 400 },
    );
  }

  try {
    const { filename, kind } = await req.json();
    const prefix = kind === "turnitin" ? "turnitin" : "karya";
    const ext = (filename || "").split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return Response.json({ error: "File karya harus PDF" }, { status: 400 });
    }

    const path = `${kategori}/${prefix}-${Date.now()}-${Math.round(Math.random() * 1e4)}.pdf`;
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(KARYA_BUCKET).createSignedUploadUrl(path);
    if (error) throw error;

    const { data: pub } = admin.storage.from(KARYA_BUCKET).getPublicUrl(path);
    return Response.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
  } catch (error) {
    console.error("Error signed upload url:", error.message);
    return Response.json(
      { error: "Gagal menyiapkan upload", message: error.message },
      { status: 500 },
    );
  }
}
