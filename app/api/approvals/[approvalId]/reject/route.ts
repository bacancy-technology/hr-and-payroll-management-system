import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalString } from "@/lib/api/validation";
import { decideApproval } from "@/lib/services/approval-service";

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
        status: "Rejected",
        decisionNote: body.decisionNote === null ? null : readOptionalString(body, "decisionNote"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
