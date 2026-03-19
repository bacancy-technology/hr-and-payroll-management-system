import { NextResponse } from "next/server";

import { ApiError, isApiError } from "@/lib/modules/shared/api/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleRouteError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status },
    );
  }

  const unexpectedError = new ApiError(500, "An unexpected error occurred.");

  return NextResponse.json(
    {
      error: {
        message: unexpectedError.message,
      },
    },
    { status: unexpectedError.status },
  );
}
