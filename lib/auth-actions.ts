"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signIn(formData: FormData) {
  if (!env.hasSupabase) {
    redirect("/login?error=Add%20your%20Supabase%20env%20vars%20to%20enable%20authentication.");
  }

  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const supabase = await createServerClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  if (!env.hasSupabase) {
    redirect("/login?error=Add%20your%20Supabase%20env%20vars%20to%20enable%20authentication.");
  }

  const fullName = getValue(formData, "full_name");
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const supabase = await createServerClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? env.siteUrl;

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Account%20created.%20Check%20your%20email%20to%20confirm%20the%20sign-in%20link.");
}

export async function signOut() {
  const supabase = await createServerClient();

  await supabase?.auth.signOut();

  redirect("/");
}
