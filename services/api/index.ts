import { User } from "@/types/db";

type ApiError = {
  message?: string;
  error?: string;
};

type ApiCredentials = {
  apiSecret?: string;
  deviceToken?: string;
  token?: string;
};

type ApiFetchOptions = {
  signed?: boolean;
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponseData {
  token?: string;
  deviceToken?: string;
  device?: string;
  deviceId?: string;
  apiSecret?: string;
  user?: User; // if user data is also returned
  // include any other fields your backend returns
}
/**
 * Standardized handler for fetch responses.
 * Parses JSON on success or extracts error messages on failure.
 * @param res - Fetch Response object
 * @returns Parsed JSON body or null if empty
 * @throws Error with message from backend or default fallback
 */

export async function handleResponse<T>(
  res: Response,
): Promise<ApiResponse<T>> {
  if (!res.ok) {
    let error: ApiError = {};
    try {
      error = await res.json();
    } catch {}
    throw new Error(error.message || error.error || "Something went wrong");
  }

  const json = await res.json().catch(() => null);

  // If the response has a top-level 'data' property, unwrap it
  const unwrappedData = json?.data !== undefined ? json.data : json;

  return { success: true, data: unwrappedData };
}

/**
 * Validates and retrieves the backend API base URL.
 * @throws Error if the environment variable is missing.
 */
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!apiUrl || apiUrl.length === 0) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_BACKEND_API_URL!!",
    );
  }

  return apiUrl;
};

export const BASE_URL = getBaseUrl();

const API_SECRET_STORAGE_KEY = "kellon_api_secret";
const DEVICE_TOKEN_STORAGE_KEY = "kellon_device_token";
const GENERATED_DEVICE_ID_STORAGE_KEY = "kellon_generated_device_id";
const AUTH_TOKEN_STORAGE_KEY = "kellon_auth_token";

const SIGNED_ROUTE_PREFIXES = [
  "/api/v1/transfers",
  "/api/v1/onramp",
  "/api/v1/offramp",
  "/api/v1/invoices",
  "/api/v1/banks",
  "/api/v1/kyc",
  "/api/v1/cards",
  "/api/v1/yield",
  "/api/v1/biometric",
];

function canUseBrowserCrypto(): boolean {
  return typeof crypto !== "undefined" && !!crypto.subtle;
}

function getStoredValue(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;

  return sessionStorage.getItem(key) || localStorage.getItem(key) || undefined;
}

function setStoredValue(key: string, value: string): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
}

export function persistApiCredentials(credentials: ApiCredentials): void {
  if (credentials.token) {
    setStoredValue(AUTH_TOKEN_STORAGE_KEY, credentials.token);
  }

  if (credentials.apiSecret) {
    setStoredValue(API_SECRET_STORAGE_KEY, credentials.apiSecret);
  }

  if (credentials.deviceToken) {
    setStoredValue(DEVICE_TOKEN_STORAGE_KEY, credentials.deviceToken);
  }
}

export function clearApiCredentials(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(API_SECRET_STORAGE_KEY);
  sessionStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(API_SECRET_STORAGE_KEY);
  localStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getOrCreateDeviceId(): string {
  const existingDeviceId = getStoredValue(GENERATED_DEVICE_ID_STORAGE_KEY);

  if (existingDeviceId) return existingDeviceId;

  const deviceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `web_${crypto.randomUUID()}`
      : `web_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  setStoredValue(GENERATED_DEVICE_ID_STORAGE_KEY, deviceId);
  return deviceId;
}

function getApiCredentials(): Required<ApiCredentials> {
  const token = getStoredValue(AUTH_TOKEN_STORAGE_KEY);
  const apiSecret = getStoredValue(API_SECRET_STORAGE_KEY);
  const deviceToken = getStoredValue(DEVICE_TOKEN_STORAGE_KEY);

  if (!token || !apiSecret || !deviceToken) {
    throw new Error("Secure session missing. Please log in again.");
  }

  return { token, apiSecret, deviceToken };
}

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function createSignature(
  apiSecret: string,
  payload: string,
): Promise<string> {
  if (!canUseBrowserCrypto()) {
    throw new Error("Request signing is unavailable in this browser.");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return toHex(signature);
}

function normalizeRequestBody(body: RequestInit["body"]): {
  body: RequestInit["body"];
  rawBody: string;
} {
  if (body === undefined || body === null) {
    return { body: undefined, rawBody: "" };
  }

  if (typeof body === "string") {
    return { body, rawBody: body };
  }

  return { body, rawBody: "" };
}

function getBackendUrl(input: string): URL {
  const baseOrigin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const requestUrl = new URL(input, baseOrigin);

  if (
    requestUrl.origin === baseOrigin &&
    requestUrl.pathname.startsWith("/api/")
  ) {
    const backendBase = new URL(
      BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`,
    );
    const backendPath = requestUrl.pathname.replace(/^\/api\/?/, "");
    return new URL(`${backendPath}${requestUrl.search}`, backendBase);
  }

  return requestUrl;
}

function createCanonicalPath(url: URL): string {
  const path =
    url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const sortedParams = Array.from(url.searchParams.entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey
        ? leftValue.localeCompare(rightValue)
        : leftKey.localeCompare(rightKey),
  );
  const query = sortedParams
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return query ? `${path}?${query}` : path;
}

function shouldSignRequest(canonicalPath: string): boolean {
  return SIGNED_ROUTE_PREFIXES.some((prefix) =>
    canonicalPath.startsWith(prefix),
  );
}

async function createSigningHeaders(
  method: string,
  canonicalPath: string,
  rawBody: string,
): Promise<Record<string, string>> {
  const { token, apiSecret, deviceToken } = getApiCredentials();
  const timestamp = Date.now().toString();
  const nonce = createNonce();
  const payload = `${timestamp}:${nonce}:${deviceToken}:${method}:${canonicalPath}:${rawBody}`;
  const signature = await createSignature(apiSecret, payload);

  return {
    Authorization: `Bearer ${token}`,
    "x-request-timestamp": timestamp,
    "x-request-nonce": nonce,
    "x-device-id": deviceToken,
    "x-request-signature": signature,
  };
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const { body, rawBody } = normalizeRequestBody(init.body);
  const backendUrl = getBackendUrl(input);
  const canonicalPath = createCanonicalPath(backendUrl);
  const mustSign =
    options.signed === true ||
    (options.signed !== false && shouldSignRequest(canonicalPath));
  const headers = new Headers(init.headers);

  if (body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (mustSign) {
    const signingBody = ["GET", "DELETE"].includes(method) ? "" : rawBody;
    const signingHeaders = await createSigningHeaders(
      method,
      canonicalPath,
      signingBody,
    );

    Object.entries(signingHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const credentials = init.credentials || (mustSign ? "omit" : "include");

  return fetch(input, {
    ...init,
    method,
    headers,
    credentials,
    body: ["GET", "DELETE"].includes(method) ? undefined : body,
  });
}
