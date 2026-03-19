const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

const derivedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const env = {
  hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
  siteUrl: derivedSiteUrl,
  supabaseAnonKey,
  supabaseUrl,
};
