import {
  createBackupJob,
  listBackupJobs,
} from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listBackupJobs(supabase, organizationId, {
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        backupType: readOptionalString({ backupType: url.searchParams.get("backupType") }, "backupType"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createBackupJob(supabase, organizationId, {
        backupType: readOptionalString(body, "backupType"),
        status: readOptionalString(body, "status"),
        startedAt: body.startedAt === null ? null : readOptionalDate(body, "startedAt"),
        completedAt: body.completedAt === null ? null : readOptionalDate(body, "completedAt"),
        retentionUntil:
          body.retentionUntil === null ? null : readOptionalDate(body, "retentionUntil"),
        storagePath: readRequiredString(body, "storagePath", "Storage path"),
        snapshotSizeMb: readOptionalNumber(body, "snapshotSizeMb"),
        triggeredByName: readRequiredString(body, "triggeredByName", "Triggered by"),
        summary: body.summary === null ? null : readOptionalString(body, "summary"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
