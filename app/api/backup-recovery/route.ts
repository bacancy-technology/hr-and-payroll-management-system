import { getBackupRecoveryOverview } from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBackupRecoveryOverview(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
