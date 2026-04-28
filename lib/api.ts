import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";
import { AppError, isAppError, isDatabaseUnavailableError, isLikelyRuntimeCallError } from "@/lib/errors";

export function parseSearchParams<T>(searchParams: URLSearchParams, schema: ZodType<T, z.ZodTypeDef, unknown>) {
  const raw: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    throw new AppError(400, "Invalid query parameters.", "VALIDATION_ERROR", parsed.error.flatten());
  }

  return parsed.data;
}

export async function parseRequestBody<T>(request: Request, schema: ZodType<T, z.ZodTypeDef, unknown>) {
  let json: unknown;
  const contentLength = request.headers.get("content-length");
  const hasBody = contentLength ? Number(contentLength) > 0 : true;

  if (!hasBody) {
    throw new AppError(400, "Request body is required.", "EMPTY_BODY");
  }

  try {
    json = await request.json();
  } catch {
    throw new AppError(400, "Request body must be valid JSON.", "INVALID_JSON");
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new AppError(400, "Invalid request payload.", "VALIDATION_ERROR", parsed.error.flatten());
  }

  return parsed.data;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 201, ...init });
}

export function paginated<T>(
  result: { data: T[]; total: number; page: number; limit: number; totalPages: number },
  init?: ResponseInit
) {
  return NextResponse.json(result, init);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleApiError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        code: "VALIDATION_ERROR",
        details: error.flatten()
      },
      { status: 400 }
    );
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      {
        error: "Service is temporarily unavailable. Please try again shortly.",
        code: "SERVICE_UNAVAILABLE"
      },
      { status: 503 }
    );
  }

  if (isLikelyRuntimeCallError(error)) {
    return NextResponse.json(
      {
        error: "A runtime dependency failed while processing this request. Please retry.",
        code: "RUNTIME_DEPENDENCY_ERROR"
      },
      { status: 500 }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: "Unexpected server error.",
      code: "INTERNAL_SERVER_ERROR"
    },
    { status: 500 }
  );
}
