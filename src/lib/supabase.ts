import { PostgrestClient } from "@supabase/postgrest-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The app only reads and writes table rows, so use the REST client directly
// instead of the full supabase-js client, which also bundles auth, realtime
// and storage code (~230 KB) that nothing here calls.
export const supabase = new PostgrestClient(`${supabaseUrl}/rest/v1`, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});
