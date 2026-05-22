import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublishableOrAnonKey, getSupabaseUrl } from "@/utils/supabase/env";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableOrAnonKey());
}
