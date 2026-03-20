"use client";

interface ApiErrorBody {
  error?: {
    message?: string;
  };
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiErrorBody & { data?: T };

  if (!response.ok) {
    throw new Error(body.error?.message ?? "Request failed.");
  }

  return body.data as T;
}

export async function requestApi<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return readApiResponse<T>(response);
}
