import Link from "next/link";

import { signIn, signUp } from "@/lib/auth-actions";

interface AuthPanelsProps {
  authEnabled: boolean;
  error?: string;
  message?: string;
}

export function AuthPanels({ authEnabled, error, message }: AuthPanelsProps) {
  return (
    <section className="auth-grid">
      <article className="auth-card">
        <div>
          <span className="eyebrow">Sign in</span>
          <h2>Access the live workspace.</h2>
        </div>
        <p className="auth-note">
          Use email/password auth through Supabase. Once authenticated, the dashboard reads server-side data with session-aware cookies.
        </p>
        <form action={signIn} className="auth-form">
          <div className="field">
            <label htmlFor="signin-email">Email</label>
            <input id="signin-email" name="email" placeholder="maya@company.com" required type="email" />
          </div>
          <div className="field">
            <label htmlFor="signin-password">Password</label>
            <input id="signin-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" />
          </div>
          <button className="button" disabled={!authEnabled} type="submit">
            Sign in
          </button>
        </form>
      </article>

      <article className="auth-card">
        <div>
          <span className="eyebrow">Create account</span>
          <h2>Provision a new HR admin.</h2>
        </div>
        <p className="auth-note">
          New accounts automatically get a starter profile row through the included Supabase trigger and land in the seeded organization.
        </p>
        <form action={signUp} className="auth-form">
          <div className="field">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" name="full_name" placeholder="Maya Chen" required type="text" />
          </div>
          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" name="email" placeholder="maya@company.com" required type="email" />
          </div>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" />
          </div>
          <button className="button-secondary" disabled={!authEnabled} type="submit">
            Create account
          </button>
        </form>
      </article>

      <article className="auth-card">
        <div className="split">
          <span className="small-label">Status</span>
          <span className={`status-badge ${authEnabled ? "status-paid" : "status-pending"}`}>
            {authEnabled ? "Supabase connected" : "Waiting for env vars"}
          </span>
        </div>
        <p className="auth-note">
          {authEnabled
            ? "Auth is enabled. After applying the SQL files, sign in to load live dashboard data."
            : "Authentication is disabled until you add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."}
        </p>
        {message ? <p className="notice"><span>{message}</span></p> : null}
        {error ? <p className="notice"><span>{error}</span></p> : null}
        <div className="split">
          <Link className="button-ghost" href="/dashboard">
            View demo dashboard
          </Link>
          <Link className="button-ghost" href="/#deploy">
            Setup guide
          </Link>
        </div>
      </article>
    </section>
  );
}
