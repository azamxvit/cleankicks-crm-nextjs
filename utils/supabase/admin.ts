import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/utils/supabase/env";

export function createAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error("Supabase не настроен: NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
