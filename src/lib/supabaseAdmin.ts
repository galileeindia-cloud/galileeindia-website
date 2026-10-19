import "server-only";
import { PostgrestClient } from "@supabase/postgrest-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only client that signs requests with the service role key, which
 * bypasses Row Level Security entirely. The `families`/`members` tables
 * only grant public INSERT (so a visitor can submit the registration form
 * but nobody can read another family's phone numbers or birthdays back
 * out) -- this client is how a trusted, server-side page reads that data
 * anyway. The `server-only` import makes bundling this into a "use
 * client" component a build-time error instead of a silent leak.
 */
export const supabaseAdmin = new PostgrestClient(`${supabaseUrl}/rest/v1`, {
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  },
});
