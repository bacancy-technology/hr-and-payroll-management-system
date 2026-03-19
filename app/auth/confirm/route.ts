import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = `${origin}${next}`;

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${env.siteUrl}/login?error=Missing%20confirmation%20token.`);
  }

  const supabase = await createServerClient();

  if (!supabase) {
    return NextResponse.redirect(`${env.siteUrl}/login?error=Supabase%20is%20not%20configured.`);
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email" | "recovery" | "invite" | "email_change",
  });

  if (error) {
    return NextResponse.redirect(`${env.siteUrl}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(redirectTo);
}
