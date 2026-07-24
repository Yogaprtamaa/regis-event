-- Event: lampiran buku panduan + grup WA + skema form-builder
ALTER TABLE "Event" ADD COLUMN "panduanUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "waGroupLink" TEXT;
ALTER TABLE "Event" ADD COLUMN "formSchema" JSONB;

-- Participant: jawaban field custom form-builder
ALTER TABLE "Participant" ADD COLUMN "formData" JSONB;
