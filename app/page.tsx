import Link from "next/link";

import { DashboardView } from "@/components/dashboard-view";
import { SiteHeader } from "@/components/site-header";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const data = await getDashboardData({ preview: true });

  return (
    <main>
      <div className="page-shell">
        <SiteHeader profile={data.mode === "live" || data.mode === "hybrid" ? data.profile : undefined} />

        <section className="hero" id="platform">
          <article className="hero-copy">
            <span className="eyebrow">Next.js App Router + Supabase</span>
            <h1>HR and payroll software that looks real from day one.</h1>
            <p className="lead">
              This starter ships as a production-ready Next.js application with responsive UI, SSR-aware Supabase auth, relational data access, seeded content, and a clean path to Vercel deployment.
            </p>
            <div className="hero-actions">
              <Link className="button-secondary" href="/dashboard">
                Open demo workspace
              </Link>
              <Link className="button-ghost" href="/login">
                Configure auth
              </Link>
            </div>
            <div className="hero-meta">
              <div className="hero-stat">
                <strong>App Router</strong>
                <span className="muted">Server components, route handlers, and server actions.</span>
              </div>
              <div className="hero-stat">
                <strong>Supabase</strong>
                <span className="muted">Auth, RLS-friendly tables, and middleware-refreshed sessions.</span>
              </div>
              <div className="hero-stat">
                <strong>Vercel</strong>
                <span className="muted">Zero-config deploy with env-based setup and standalone output.</span>
              </div>
            </div>
          </article>

          <aside className="hero-card">
            <div className="split">
              <span className="small-label">Launch checklist</span>
              <span className={`status-badge ${data.mode === "live" ? "status-paid" : "status-processing"}`}>
                {data.mode === "live" ? "Live connected" : "Demo-ready"}
              </span>
            </div>
            <div className="hero-card-grid">
              <div className="mini-card">
                <span className="small-label">1</span>
                <strong>Add env vars</strong>
                <p>Drop in your Supabase URL and anon key to enable server-authenticated sessions.</p>
              </div>
              <div className="mini-card">
                <span className="small-label">2</span>
                <strong>Run SQL</strong>
                <p>Apply the included schema and seed scripts for employees, payroll runs, and leave approvals.</p>
              </div>
              <div className="mini-card">
                <span className="small-label">3</span>
                <strong>Create an admin</strong>
                <p>Use the signup form to create a workspace admin profile backed by Supabase Auth.</p>
              </div>
              <div className="mini-card">
                <span className="small-label">4</span>
                <strong>Ship to Vercel</strong>
                <p>Build and deploy with the included config, environment example, and production scripts.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="section-heading">
          <div>
            <span className="eyebrow">What is included</span>
            <h2>Everything needed for a polished first release.</h2>
          </div>
          <p className="lead">The app is built to demo well before configuration and transition cleanly to live infrastructure once connected.</p>
        </section>

        <section className="features-grid">
          <article className="feature-card">
            <strong>Production-ready shell</strong>
            <p>App Router routes, strong TypeScript defaults, linting, and a deployment-friendly Next.js configuration.</p>
          </article>
          <article className="feature-card">
            <strong>Responsive interface</strong>
            <p>Purposeful typography, card-based layouts, and mobile-safe tables without relying on a generic template look.</p>
          </article>
          <article className="feature-card">
            <strong>Auth + database</strong>
            <p>Supabase auth flows, SSR cookies, middleware session refresh, and relational data tables with RLS policies.</p>
          </article>
          <article className="feature-card">
            <strong>Starter content</strong>
            <p>Seed SQL plus a runtime demo fallback so the workspace stays populated on the first visit and in empty environments.</p>
          </article>
        </section>
      </div>

      <DashboardView data={data} preview />

      <div className="page-shell" id="deploy">
        <section className="section-heading">
          <div>
            <span className="eyebrow">Deployment</span>
            <h2>Vercel-ready by default.</h2>
          </div>
          <p className="lead">Set the same environment variables in Vercel, deploy, and the middleware-backed Supabase session flow works without extra adapters.</p>
        </section>

        <section className="setup-grid">
          <article className="feature-card">
            <strong>Required environment variables</strong>
            <p>
              `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are documented in the root example file.
            </p>
          </article>
          <article className="feature-card">
            <strong>Database bootstrap</strong>
            <p>Run `supabase/schema.sql` first, then `supabase/seed.sql` to preload the employee roster, payroll cycles, and leave requests.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
