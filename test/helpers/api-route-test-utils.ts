import type { ApiContext } from "@/lib/modules/shared/api/context";
import { expect } from "vitest";

export function createApiContext(overrides: Partial<ApiContext> = {}): ApiContext {
  return {
    supabase: {} as ApiContext["supabase"],
    user: {
      id: "user-1",
    } as ApiContext["user"],
    profile: {
      id: "user-1",
      full_name: "Maya Chen",
      email: "maya@pulsehr.app",
      role: "HR Admin",
      organization_id: "org-1",
    },
    organizationId: "org-1",
    assignedRoles: [],
    ...overrides,
  };
}

export function createJsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function expectDataResponse(response: Response, data: unknown, status = 200) {
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ data });
}

export async function expectErrorResponse(response: Response, status: number, message: string) {
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({
    error: {
      message,
      details: null,
    },
  });
}
