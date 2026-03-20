import {
  createRecoveryEvent,
  listRecoveryEvents,
} from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listRecoveryEvents(supabase, organizationId, {
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        recoveryType: readOptionalString(
          { recoveryType: url.searchParams.get("recoveryType") },
          "recoveryType",
        ),
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
      await createRecoveryEvent(supabase, organizationId, {
        backupJobId: body.backupJobId === null ? null : readOptionalUuid(body, "backupJobId"),
        recoveryType: readOptionalString(body, "recoveryType"),
        status: readOptionalString(body, "status"),
        startedAt: body.startedAt === null ? null : readOptionalDate(body, "startedAt"),
        completedAt: body.completedAt === null ? null : readOptionalDate(body, "completedAt"),
        targetScope: readRequiredString(body, "targetScope", "Target scope"),
        requestedByName: readRequiredString(body, "requestedByName", "Requested by"),
        approvedByName:
          body.approvedByName === null ? null : readOptionalString(body, "approvedByName"),
        summary: body.summary === null ? null : readOptionalString(body, "summary"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
