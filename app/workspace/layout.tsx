import { redirect } from "next/navigation";

import { WorkspaceShell } from "@/components/workspace-shell/workspace-shell";
import { getDashboardData } from "@/lib/data";
import { getOptionalSessionContext } from "@/lib/modules/shared/api/context";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSessionContext();

  if (!session.authenticated || !session.profile) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <WorkspaceShell
      mode={data.mode}
      notice={data.notice}
      profile={data.profile}
    >
      {children}
    </WorkspaceShell>
  );
}
