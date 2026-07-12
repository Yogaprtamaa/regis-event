export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "../../../lib/prisma";
import { sendConfirmationEmail } from "../../../lib/mail";
import { createAdminClient } from "../../../lib/supabase/admin";
import { eventSlug } from "../../../lib/kategori";

const PARTICIPANT_BUCKET = "participant-uploads";
/* =======================
   GET → ambil semua peserta
======================= */
export async function GET() {
  try {
    const data = await prisma.participant.findMany({
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching participants:", error.message);
    return Response.json(
      { error: "Failed to fetch participants", message: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → daftar peserta
======================= */
export async function POST(req) {
  try {
    const formData = await req.formData();

    const nama = formData.get("nama");
    const email = formData.get("email");
    const nim = formData.get("nim");
    const no_wa = formData.get("no_wa");
    const jurusan = formData.get("jurusan");
    const divisi = formData.get("divisi");
    const instansi = formData.get("instansi");
    const angkatan = formData.get("angkatan");
    const status = formData.get("status");
    const role = formData.get("role");
    const eventId = formData.get("eventId");
    const file = formData.get("bukti_pembayaran");
    const password = formData.get("password");
    const setujuSyaratKti = formData.get("setujuSyaratKti") === "true";

    // ── IT FEST 6.0 — field pendaftaran lomba ──
    const jenisPeserta = formData.get("jenisPeserta");
    const universitas = formData.get("universitas");
    const fakultas = formData.get("fakultas");
    const kotaDomisili = formData.get("kotaDomisili");
    const provinsi = formData.get("provinsi");
    const anggotaRaw = formData.get("anggota");
    const buktiFollowFile = formData.get("buktiFollow");
    const fotoKtmFiles = formData.getAll("fotoKtm");

    let anggota = null;
    try {
      anggota = anggotaRaw ? JSON.parse(anggotaRaw) : null;
    } catch {
      anggota = null;
    }

    const admin = createAdminClient();

    // Helper upload satu file ke Supabase Storage
    const uploadToSupabase = async (f, prefix) => {
      const bytes = await f.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = f.name?.split(".").pop() || "bin";
      const path = `${eventSlug(event.nama_event)}/${prefix}-${Date.now()}-${Math.round(Math.random() * 1e4)}.${ext}`;

      const { error: uploadError } = await admin.storage
        .from(PARTICIPANT_BUCKET)
        .upload(path, buffer, { contentType: f.type || "application/octet-stream" });
      if (uploadError) throw uploadError;

      const { data } = admin.storage.from(PARTICIPANT_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    };

    /* ===== VALIDASI EVENT ID ===== */
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(eventId)) {
      return Response.json(
        { message: "Event ID tidak valid" },
        { status: 400 },
      );
    }

    /* ===== VALIDASI WAJIB ===== */
    if (!nama || !email || !eventId) {
      return Response.json({ message: "Data belum lengkap" }, { status: 400 });
    }

    /* ===== CEK DOUBLE ===== */
    const checkDuplicateFilter =
      nim && nim !== "N/A" ? { nim, eventId } : { email, eventId };

    const existing = await prisma.participant.findFirst({
      where: checkDuplicateFilter,
    });

    if (existing) {
      return Response.json(
        { message: "Kamu sudah terdaftar di event ini" },
        { status: 400 },
      );
    }

    /* ===== CEK EVENT ===== */
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return Response.json(
        { message: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    /* ===== CEK KUOTA ===== */
    if (event.kapasitas && event.participants.length >= event.kapasitas) {
      return Response.json(
        { message: "Kuota event sudah penuh" },
        { status: 400 },
      );
    }

    /* ===== PERSETUJUAN SYARAT KTI (khusus event KTI) ===== */
    const isKti = eventSlug(event.nama_event) === "kti";
    if (isKti && !setujuSyaratKti) {
      return Response.json(
        { message: "Wajib menyetujui persyaratan lomba KTI" },
        { status: 400 },
      );
    }

    /* ===== BUAT AKUN LOGIN PESERTA (kalau kirim password) ===== */
    // Akun dipakai peserta buat login & pantau status verifikasi + upload karya.
    // Tanpa password = alur lama (event tanpa login), tetap jalan.
    let supabaseId = null;
    if (password) {
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nama },
          // Ditaruh di JWT → middleware bisa cegah peserta buka area admin
          // tanpa query DB. Lihat middleware.js.
          app_metadata: { role: "peserta" },
        });
      if (authError) {
        // ponytail: 1 email = 1 akun. Kalau mau reuse akun buat multi-event,
        // upgrade: lookup user by email lalu link supabaseId-nya.
        const dup = /already|registered|exists/i.test(authError.message || "");
        return Response.json(
          {
            message: dup
              ? "Email ini sudah punya akun. Pakai email lain atau login."
              : "Gagal membuat akun: " + authError.message,
          },
          { status: 400 },
        );
      }
      supabaseId = authData.user.id;
    }

    /* ===============================
       🔥 HANDLE UPLOAD CLOUDINARY
    ================================ */

    let buktiUrl = null;
    let paymentStatus = "FREE";

    if (event.isPaidEvent) {
      if (!file || file.size === 0) {
        return Response.json(
          { message: "Bukti pembayaran wajib diupload" },
          { status: 400 },
        );
      }

      buktiUrl = await uploadToSupabase(file, "bukti");
      paymentStatus = "PENDING";
    } else if (jenisPeserta) {
      // Lomba gratis (follow IG + KTM) tetap butuh review panitia sebelum
      // peserta boleh upload karya — tanpa ini paymentStatus="FREE" gak
      // pernah masuk antrian & peserta terkunci upload selamanya.
      paymentStatus = "PENDING";
    }

    /* ===== UPLOAD BUKTI FOLLOW IG & FOTO KTM ===== */
    let buktiFollowUrl = null;
    if (buktiFollowFile && buktiFollowFile.size > 0) {
      buktiFollowUrl = await uploadToSupabase(buktiFollowFile, "follow");
    }

    const fotoKtmUrls = [];
    for (const f of fotoKtmFiles) {
      if (f && typeof f.arrayBuffer === "function" && f.size > 0) {
        fotoKtmUrls.push(await uploadToSupabase(f, "ktm"));
      }
    }

    /* ===== SIMPAN KE DB ===== */
    const participant = await prisma.participant.create({
      data: {
        nama,
        email,
        nim,
        no_wa,
        jurusan,
        angkatan,
        status: status || "terdaftar",
        role: role || "PESERTA",
        event: {
          connect: { id: eventId },
        },
        buktiPembayaran: buktiUrl,
        paymentStatus,
        instansi,
        divisi,
        jenisPeserta,
        universitas,
        fakultas,
        kotaDomisili,
        provinsi,
        anggota: anggota ?? undefined,
        buktiFollow: buktiFollowUrl,
        fotoKtm: fotoKtmUrls.length ? fotoKtmUrls : undefined,
        supabaseId,
        setujuSyaratKti,
      },
      include: { event: true },
    });

    /* ===== KIRIM EMAIL ===== */
    try {
      await sendConfirmationEmail(
        email,
        {
          ...participant,
          jurusan,
          divisi,
          instansi,
        },
        participant.event,
      );
    } catch (emailError) {
      console.error("Warning: Email gagal terkirim:", emailError.message);
    }

    return Response.json(participant, { status: 201 });
  } catch (err) {
    console.error("Error creating participant:", err);
    return Response.json(
      { message: "Terjadi kesalahan server", error: err.message },
      { status: 500 },
    );
  }
}
