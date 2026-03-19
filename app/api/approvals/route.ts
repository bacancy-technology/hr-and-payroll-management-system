import { listApprovals } from "@/lib/modules/approvals/services/approval-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { supabase, organizationId } = await requireApiContext();

    return ok(
      await listApprovals(supabase, organizationId, {
        entityType: searchParams.get("entityType") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
