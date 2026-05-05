import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const supabase =
  supabaseUrl && secretKey
    ? createClient(supabaseUrl, secretKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

if (!supabase) {
  console.warn("Supabase environment variables are missing; view counts will use local fallbacks.");
}
