import type { UserProfile } from "@/lib/types";

import { SiteHeader } from "@/components/site-header";
import { WorkspaceNav } from "@/components/workspace-shell/workspace-nav";

interface WorkspaceShellProps {
  children: React.ReactNode;
  notice: string;
  mode: "demo" | "live" | "hybrid";
  profile?: UserProfile;
}

export function WorkspaceShell({
  children,
  notice,
  mode,
  profile,
}: WorkspaceShellProps) {
  const workspaceLabel =
    mode === "live" ? "Live workspace" : mode === "hybrid" ? "Live-ready preview" : "Demo workspace";

  return (
    <main>
      <div className="page-shell">
        <SiteHeader profile={profile} />
      </div>

      <div className="page-shell workspace-shell">
        <aside className="workspace-sidebar">
          <div className="workspace-sidebar-top">
            <span className="small-label">Workspace</span>
            <strong>{workspaceLabel}</strong>
            <p className="muted">{notice}</p>
          </div>
          <WorkspaceNav />
        </aside>

        <div className="workspace-content">{children}</div>
      </div>
    </main>
  );
}
