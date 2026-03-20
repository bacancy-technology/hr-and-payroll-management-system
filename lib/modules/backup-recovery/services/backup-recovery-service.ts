import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface BackupJobFilters {
  status?: string;
  backupType?: string;
}

interface BackupJobInput {
  backupType?: string;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  retentionUntil?: string | null;
  storagePath?: string;
  snapshotSizeMb?: number;
  triggeredByName?: string;
  summary?: string | null;
}

interface RecoveryEventFilters {
  status?: string;
  recoveryType?: string;
}

interface RecoveryEventInput {
  backupJobId?: string | null;
  recoveryType?: string;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  targetScope?: string;
  requestedByName?: string;
  approvedByName?: string | null;
  summary?: string | null;
}

interface BackupJobRow {
  id: string;
  backup_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  retention_until: string | null;
  storage_path: string;
  snapshot_size_mb: number;
  triggered_by_name: string;
  summary: string | null;
  created_at: string;
}

interface RecoveryEventRow {
  id: string;
  backup_job_id: string | null;
  recovery_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  target_scope: string;
  requested_by_name: string;
  approved_by_name: string | null;
  summary: string | null;
  created_at: string;
  backup_jobs:
    | {
        id: string;
        backup_type: string;
        status: string;
        storage_path: string;
      }
    | {
        id: string;
        backup_type: string;
        status: string;
        storage_path: string;
      }[]
    | null;
}

const BACKUP_JOB_SELECT = `
  id,
  backup_type,
  status,
  started_at,
  completed_at,
  retention_until,
  storage_path,
  snapshot_size_mb,
  triggered_by_name,
  summary,
  created_at
`;

const RECOVERY_EVENT_SELECT = `
  id,
  backup_job_id,
  recovery_type,
  status,
  started_at,
  completed_at,
  target_scope,
  requested_by_name,
  approved_by_name,
  summary,
  created_at,
  backup_jobs (
    id,
    backup_type,
    status,
    storage_path
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeBackupJob(row: BackupJobRow) {
  return {
    id: row.id,
    backupType: row.backup_type,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    retentionUntil: row.retention_until,
    storagePath: row.storage_path,
    snapshotSizeMb: row.snapshot_size_mb,
    triggeredByName: row.triggered_by_name,
    summary: row.summary,
    createdAt: row.created_at,
  };
}

function normalizeRecoveryEvent(row: RecoveryEventRow) {
  return {
    id: row.id,
    backupJobId: row.backup_job_id,
    recoveryType: row.recovery_type,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    targetScope: row.target_scope,
    requestedByName: row.requested_by_name,
    approvedByName: row.approved_by_name,
    summary: row.summary,
    createdAt: row.created_at,
    backupJob: normalizeRelation(row.backup_jobs),
  };
}

function buildBackupJobPayload(input: BackupJobInput) {
  return Object.fromEntries(
    Object.entries({
      backup_type: input.backupType,
      status: input.status,
      started_at: input.startedAt,
      completed_at: input.completedAt,
      retention_until: input.retentionUntil,
      storage_path: input.storagePath,
      snapshot_size_mb: input.snapshotSizeMb,
      triggered_by_name: input.triggeredByName,
      summary: input.summary,
    }).filter(([, value]) => value !== undefined),
  );
}

function buildRecoveryEventPayload(input: RecoveryEventInput) {
  return Object.fromEntries(
    Object.entries({
      backup_job_id: input.backupJobId,
      recovery_type: input.recoveryType,
      status: input.status,
      started_at: input.startedAt,
      completed_at: input.completedAt,
      target_scope: input.targetScope,
      requested_by_name: input.requestedByName,
      approved_by_name: input.approvedByName,
      summary: input.summary,
    }).filter(([, value]) => value !== undefined),
  );
}

async function ensureBackupJobExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  backupJobId: string,
) {
  const { data, error } = await supabase
    .from("backup_jobs")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", backupJobId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the backup job reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Backup job not found.");
  }
}

export async function listBackupJobs(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: BackupJobFilters = {},
) {
  let query = supabase
    .from("backup_jobs")
    .select(BACKUP_JOB_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.backupType) {
    query = query.eq("backup_type", filters.backupType);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load backup jobs.", error.message);
  }

  return ((data as BackupJobRow[] | null) ?? []).map((row) => normalizeBackupJob(row));
}

export async function getBackupJobById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  backupJobId: string,
) {
  const { data, error } = await supabase
    .from("backup_jobs")
    .select(BACKUP_JOB_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", backupJobId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the backup job.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Backup job not found.");
  }

  return normalizeBackupJob(data as BackupJobRow);
}

export async function createBackupJob(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<BackupJobInput, "storagePath" | "triggeredByName">> & BackupJobInput,
) {
  const { data, error } = await supabase
    .from("backup_jobs")
    .insert({
      organization_id: organizationId,
      ...buildBackupJobPayload({
        ...input,
        backupType: input.backupType ?? "Full",
        status: input.status ?? "Completed",
        startedAt: input.startedAt ?? new Date().toISOString(),
        completedAt: input.completedAt ?? new Date().toISOString(),
        retentionUntil: input.retentionUntil ?? null,
        snapshotSizeMb: input.snapshotSizeMb ?? 0,
        summary: input.summary ?? null,
      }),
    })
    .select(BACKUP_JOB_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the backup job.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Backup job creation did not return a record.");
  }

  return normalizeBackupJob(data as BackupJobRow);
}

export async function listRecoveryEvents(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: RecoveryEventFilters = {},
) {
  let query = supabase
    .from("recovery_events")
    .select(RECOVERY_EVENT_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.recoveryType) {
    query = query.eq("recovery_type", filters.recoveryType);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load recovery events.", error.message);
  }

  return ((data as RecoveryEventRow[] | null) ?? []).map((row) => normalizeRecoveryEvent(row));
}

export async function getRecoveryEventById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  recoveryEventId: string,
) {
  const { data, error } = await supabase
    .from("recovery_events")
    .select(RECOVERY_EVENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", recoveryEventId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the recovery event.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Recovery event not found.");
  }

  return normalizeRecoveryEvent(data as RecoveryEventRow);
}

export async function createRecoveryEvent(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<RecoveryEventInput, "targetScope" | "requestedByName">> & RecoveryEventInput,
) {
  if (input.backupJobId) {
    await ensureBackupJobExists(supabase, organizationId, input.backupJobId);
  }

  const { data, error } = await supabase
    .from("recovery_events")
    .insert({
      organization_id: organizationId,
      ...buildRecoveryEventPayload({
        ...input,
        backupJobId: input.backupJobId ?? null,
        recoveryType: input.recoveryType ?? "Point-in-time",
        status: input.status ?? "Completed",
        startedAt: input.startedAt ?? new Date().toISOString(),
        completedAt: input.completedAt ?? new Date().toISOString(),
        approvedByName: input.approvedByName ?? null,
        summary: input.summary ?? null,
      }),
    })
    .select(RECOVERY_EVENT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the recovery event.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Recovery event creation did not return a record.");
  }

  return normalizeRecoveryEvent(data as RecoveryEventRow);
}

export async function getBackupRecoveryOverview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [backupJobs, recoveryEvents] = await Promise.all([
    listBackupJobs(supabase, organizationId),
    listRecoveryEvents(supabase, organizationId),
  ]);

  const latestBackup = backupJobs[0] ?? null;
  const latestRecovery = recoveryEvents[0] ?? null;

  return {
    summary: {
      totalBackups: backupJobs.length,
      totalRecoveries: recoveryEvents.length,
      successfulBackups: backupJobs.filter((job) => job.status === "Completed").length,
      successfulRecoveries: recoveryEvents.filter((event) => event.status === "Completed").length,
      latestBackupAt: latestBackup?.completedAt ?? latestBackup?.startedAt ?? null,
      latestRecoveryAt: latestRecovery?.completedAt ?? latestRecovery?.startedAt ?? null,
    },
    backupJobs,
    recoveryEvents,
  };
}
