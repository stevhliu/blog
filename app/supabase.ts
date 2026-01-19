import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

if (!supabase) {
  const message = "Supabase environment variables are missing";
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}

export default supabase;

