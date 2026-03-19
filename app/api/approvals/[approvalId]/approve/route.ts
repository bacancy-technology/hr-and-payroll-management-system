import { decideApproval } from "@/lib/modules/approvals/services/approval-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString } from "@/lib/modules/shared/api/validation";

interface ApprovalDecisionRouteProps {
  params: Promise<{
    approvalId: string;
  }>;
}

export async function POST(request: Request, { params }: ApprovalDecisionRouteProps) {
  try {
    const { approvalId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await decideApproval(supabase, organizationId, approvalId, {
        status: "Approved",
        decisionNote: body.decisionNote === null ? null : readOptionalString(body, "decisionNote"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
