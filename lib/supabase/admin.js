import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — server-only, bypasses RLS, used to invite/manage juri accounts.
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (Supabase project settings → API → service_role key).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
