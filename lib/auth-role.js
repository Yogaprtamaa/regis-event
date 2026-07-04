import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Every authenticated Supabase user is panitia/admin by default (matches the
// pre-existing flat auth model). A user becomes a juri only if a matching
// row exists in the Juri table (supabaseId = auth user id).
export async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, juri: null };

  const juri = await prisma.juri.findUnique({ where: { supabaseId: user.id } });
  return { user, juri };
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}
