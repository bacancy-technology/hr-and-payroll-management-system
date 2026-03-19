import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";
import { getApprovalById } from "@/lib/services/approval-service";

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
