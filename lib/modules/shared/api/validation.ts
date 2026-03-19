import { ApiError } from "@/lib/modules/shared/api/errors";

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonBody(request: Request) {
  const body = await request.json().catch(() => {
    throw new ApiError(400, "The request body must be valid JSON.");
  });

  if (!isObject(body)) {
    throw new ApiError(400, "The request body must be a JSON object.");
  }

  return body;
}

export function readRequiredString(record: UnknownRecord, key: string, label: string) {
  const value = record[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `${label} is required.`);
  }

  return value.trim();
}

export function readOptionalString(record: UnknownRecord, key: string) {
  const value = record[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${key} must be a string.`);
  }

  return value.trim();
}

export function readRequiredEmail(record: UnknownRecord, key: string, label: string) {
  const value = readRequiredString(record, key, label).toLowerCase();

  if (!value.includes("@")) {
    throw new ApiError(400, `${label} must be a valid email address.`);
  }

  return value;
}

export function readOptionalUuid(record: UnknownRecord, key: string) {
  const value = readOptionalString(record, key);

  if (!value) {
    return undefined;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new ApiError(400, `${key} must be a valid UUID.`);
  }

  return value;
}

export function readRequiredUuid(record: UnknownRecord, key: string, label: string) {
  const value = readRequiredString(record, key, label);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new ApiError(400, `${label} must be a valid UUID.`);
  }

  return value;
}

export function readOptionalNumber(record: UnknownRecord, key: string) {
  const value = record[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ApiError(400, `${key} must be a valid number.`);
  }

  return value;
}

export function readOptionalDate(record: UnknownRecord, key: string) {
  const value = readOptionalString(record, key);

  if (!value) {
    return undefined;
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, `${key} must be a valid date string.`);
  }

  return value;
}
