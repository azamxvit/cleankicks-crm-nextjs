import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublishableOrAnonKey, getSupabaseUrl } from "@/utils/supabase/env";
import { createMiddlewareSupabase } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableOrAnonKey();

  if (process.env.CRM_OFFLINE === "1" || !supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  const { supabase, response: supabaseResponse } = createMiddlewareSupabase(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
