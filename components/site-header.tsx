import Link from "next/link";

import { signOut } from "@/lib/auth-actions";
import type { UserProfile } from "@/lib/types";

interface SiteHeaderProps {
  profile?: UserProfile;
}

export function SiteHeader({ profile }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">PH</span>
        <span>PulseHR</span>
      </Link>

      <nav className="nav-links" aria-label="Primary">
        <Link className="nav-link" href="/#platform">
          Platform
        </Link>
        <Link className="nav-link" href="/#workspace">
          Workspace
        </Link>
        <Link className="nav-link" href="/#deploy">
          Deploy
        </Link>
      </nav>

      <div className="header-actions">
        {profile ? (
          <>
            <div className="profile-chip">
              <span className="avatar">{profile.avatarLabel}</span>
              <span className="profile-copy">
                <strong>{profile.fullName}</strong>
                <span className="muted">
                  {profile.role} at {profile.organizationName}
                </span>
              </span>
            </div>
            <Link className="button-ghost" href="/dashboard">
              Open workspace
            </Link>
            <form action={signOut}>
              <button className="button-danger" type="submit">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link className="button-ghost" href="/dashboard">
              Demo workspace
            </Link>
            <Link className="button" href="/login">
              Sign in
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
