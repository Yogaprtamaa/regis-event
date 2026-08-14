export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth-role";
import { tandatanganiBerkas } from "../../../lib/storage";
import { createAdminClient } from "../../../lib/supabase/admin";
import { eventSlug } from "../../../lib/kategori";
import { pendaftaranDitutup } from "../../../lib/eventStatus";
import {
  getFormSchema,
  isFileField,
  RESERVED_TEXT_COLUMNS,
  RESERVED_FILE_COLUMNS,
} from "../../../lib/formSchema";

const PARTICIPANT_BUCKET = "participant-uploads";
/* =======================
   GET → ambil semua peserta
======================= */
export async function GET() {
  // Daftar seluruh peserta — data pribadi, panitia saja.
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    const data = await prisma.participant.findMany({
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });

    // Bucket privat — lampiran dikirim sebagai URL bertanda tangan, bukan link tetap.
    return Response.json(await tandatanganiBerkas(data));
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

    // Field struktural (di luar form-builder)
    const nama = formData.get("nama");
    const email = formData.get("email");
    const nim = formData.get("nim");
    const divisi = formData.get("divisi");
    const instansi = formData.get("instansi");
    const angkatan = formData.get("angkatan");
    const status = formData.get("status");
    // Pendaftaran terbuka untuk umum, jadi role gak boleh nurut kiriman klien —
    // tanpa daftar putih siapa pun bisa nandain dirinya PANITIA/DOSEN.
    const ROLE_BOLEH = ["PESERTA", "MAHASISWA"];
    const role = ROLE_BOLEH.includes(formData.get("role")) ? formData.get("role") : "PESERTA";
    const eventId = formData.get("eventId");
    const file = formData.get("bukti_pembayaran");
    const password = formData.get("password");
    const setujuSyaratKti = formData.get("setujuSyaratKti") === "true";
    const jenisPeserta = formData.get("jenisPeserta");
    // Kelompok punya nama tim sendiri; individu dibiarkan null → pakai nama ketua.
    const namaTim = (formData.get("namaTim") || "").trim() || null;
    const anggotaRaw = formData.get("anggota");

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
      console.log(
        `[participants] Duplicate — peserta sudah terdaftar (${JSON.stringify(checkDuplicateFilter)}), participantId=${existing.id}`,
      );
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

    /* ===== CEK TANGGAL TUTUP ===== */
    if (pendaftaranDitutup(event.tanggal_berakhir || event.tanggal)) {
      return Response.json(
        { message: "Pendaftaran event ini sudah ditutup" },
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
      // Panjang minimum juga dicek di klien; di sini biar gak bisa dilewat
      // dengan nembak endpoint langsung.
      if (String(password).length < 6) {
        return Response.json(
          { message: "Password minimal 6 karakter" },
          { status: 400 },
        );
      }
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
        if (dup) console.log(`[participants] Duplicate — akun Supabase sudah ada untuk email=${email}`);
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

    /* ===== PARSING FIELD FORM-BUILDER ===== */
    // Field bawaan (id di RESERVED_*) → kolom Participant khusus; sisanya → formData JSON.
    const cols = {}; // kolom teks/file bawaan
    const extraData = {}; // jawaban field custom → Participant.formData

    for (const field of getFormSchema(event)) {
      if (isFileField(field)) {
        const files = formData
          .getAll(field.id)
          .filter((x) => x && typeof x.arrayBuffer === "function" && x.size > 0);
        const urls = [];
        for (const f of files) urls.push(await uploadToSupabase(f, field.id));

        const fileCol = RESERVED_FILE_COLUMNS[field.id];
        if (fileCol === "single") cols[field.id] = urls[0] || null;
        else if (fileCol === "multi") cols[field.id] = urls.length ? urls : null;
        else extraData[field.id] = field.type === "files" ? urls : urls[0] || null;
      } else {
        let v = formData.get(field.id);
        if (field.type === "checkbox") v = v === "true" || v === "on";
        if (RESERVED_TEXT_COLUMNS.includes(field.id)) cols[field.id] = v ?? null;
        else extraData[field.id] = v ?? null;
      }
    }

    /* ===== SIMPAN KE DB ===== */
    const participant = await prisma.participant.create({
      data: {
        nama,
        nim,
        angkatan,
        status: status || "terdaftar",
        role,
        event: {
          connect: { id: eventId },
        },
        buktiPembayaran: buktiUrl,
        paymentStatus,
        instansi,
        divisi,
        jenisPeserta,
        namaTim,
        ...cols, // email, no_wa, jurusan, universitas, fakultas, kotaDomisili, provinsi, buktiFollow, fotoKtm
        anggota: anggota ?? undefined,
        formData: Object.keys(extraData).length ? extraData : undefined,
        supabaseId,
        setujuSyaratKti,
      },
      include: { event: true },
    });

    // ponytail: email konfirmasi pendaftaran dimatiin — peserta langsung login
    // setelah daftar. Mau diaktifin lagi? panggil sendConfirmationEmail di sini.

    return Response.json(participant, { status: 201 });
  } catch (err) {
    console.error("Error creating participant:", err);
    return Response.json(
      { message: "Terjadi kesalahan server", error: err.message },
      { status: 500 },
    );
  }
}
