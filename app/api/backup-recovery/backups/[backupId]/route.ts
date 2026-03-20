import { getBackupJobById } from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface BackupJobRouteProps {
  params: Promise<{
    backupId: string;
  }>;
}

export async function GET(_request: Request, { params }: BackupJobRouteProps) {
  try {
    const { backupId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBackupJobById(supabase, organizationId, backupId));
  } catch (error) {
    return handleRouteError(error);
  }
}
