import { getApprovalById } from "@/lib/modules/approvals/services/approval-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface ApprovalRouteProps {
  params: Promise<{
    approvalId: string;
  }>;
}

export async function GET(_request: Request, { params }: ApprovalRouteProps) {
  try {
    const { approvalId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getApprovalById(supabase, organizationId, approvalId));
  } catch (error) {
    return handleRouteError(error);
  }
}
