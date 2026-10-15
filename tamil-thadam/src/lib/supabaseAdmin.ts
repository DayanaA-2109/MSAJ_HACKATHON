// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("❌ [Supabase Admin] Supabase URL or Secret Key missing!");
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseSecretKey || "placeholder-secret-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const BUCKET_NAME = "oral history audio";
