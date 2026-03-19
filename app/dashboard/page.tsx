import { DashboardView } from "@/components/dashboard-view";
import { SiteHeader } from "@/components/site-header";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main>
      <div className="page-shell">
        <SiteHeader profile={data.mode === "live" || data.mode === "hybrid" ? data.profile : undefined} />
      </div>
      <DashboardView data={data} />
    </main>
  );
}
