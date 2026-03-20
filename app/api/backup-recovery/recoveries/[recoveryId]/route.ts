import { getRecoveryEventById } from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface RecoveryEventRouteProps {
  params: Promise<{
    recoveryId: string;
  }>;
}

export async function GET(_request: Request, { params }: RecoveryEventRouteProps) {
  try {
    const { recoveryId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getRecoveryEventById(supabase, organizationId, recoveryId));
  } catch (error) {
    return handleRouteError(error);
  }
}
