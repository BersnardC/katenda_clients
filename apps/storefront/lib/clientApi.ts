"use client";

// Cliente fetch del storefront PARA LLAMADAS CLIENT-SIDE (auth de cliente /
// registro de pedidos). No usa ISR: son POST/GET con token del navegador.
// El base apunta a NEXT_PUBLIC_API_URL (se hornea en build; en SSR dev se lee
// del .env.local). Para fetch server-side usar services/api.ts.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "katenda.customer_token";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };

  const token = getCustomerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: requestBody,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  let payload: unknown = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      // body no es JSON válido; se trata como null
    }
  } else {
    payload = await res.text();
  }

  if (!res.ok) {
    const data = payload as { message?: string } | null;
    const message =
      data && typeof data === "object" && "message" in data && data.message
        ? String(data.message)
        : "Request failed";
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export const clientApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
};
