import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client — bypasses RLS. Use ONLY in server-side code paths
 * that have already verified the caller is authorized (or in unauthenticated
 * paths like passport checks where you intentionally need elevated access).
 */
export function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
