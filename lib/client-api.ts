export interface ClientApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

function extractErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object") {
    const candidate = payload as { error?: unknown; message?: unknown };

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
  }

  return null;
}

export async function safeApiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ClientApiResult<T>> {
  try {
    const response = await fetch(input, init);
    const raw = await response.text();
    let payload: unknown = null;

    if (raw.trim()) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: extractErrorMessage(payload) ?? `Request failed with status ${response.status}.`
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload as T,
      error: null
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Network request failed. Please retry."
    };
  }
}
