import { AuthPanels } from "@/components/auth-panels";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = readParam(params.error);
  const message = readParam(params.message);

  return (
    <main>
      <div className="page-shell">
        <SiteHeader />

        <section className="section-heading">
          <div className="page-title">
            <span className="eyebrow">Authentication</span>
            <h1>Connect your HR workspace to real users.</h1>
            <p className="lead">
              Supabase-powered sign in and account creation are wired in. Without environment variables, the app stays usable in demo mode.
            </p>
          </div>
        </section>

        <AuthPanels authEnabled={env.hasSupabase} error={error} message={message} />
      </div>
    </main>
  );
}
