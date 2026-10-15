// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ [Supabase Client] NEXT_PUBLIC_SUPABASE_URL is missing in environment variables!");
}
if (!supabaseAnonKey) {
  console.error("❌ [Supabase Client] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in environment variables!");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const BUCKET_NAME = "oral history audio";
