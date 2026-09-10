const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiError = Error & { status?: number };

let sessionGeneration = 0;

export function clearTokens() {
  sessionGeneration += 1;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

function getApiUrl() {
  if (!API_URL) throw new Error("Portal API URL is not configured.");
  return API_URL;
}

function expireSession() {
  clearTokens();
  // A hard navigation clears client-only state after a refresh-token failure.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  if (typeof window !== "undefined") window.location.href = "/login";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiUrl = getApiUrl();
  const access = localStorage.getItem("access_token");
  const generation = sessionGeneration;
  const refreshToken = localStorage.getItem("refresh_token");
  function assertCurrentSession() {
    // Logout or a replacement session must retire pending refresh results.
    if (generation !== sessionGeneration || localStorage.getItem("refresh_token") !== refreshToken) {
      throw new Error("Authentication session changed.");
    }
  }
  const headers = new Headers(init.headers);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (!(init.body instanceof FormData) && init.body) headers.set("Content-Type", "application/json");
  let response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  assertCurrentSession();
  if (response.status === 401 && refreshToken) {
    const refresh = await fetch(`${apiUrl}/api/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: refreshToken }) });
    assertCurrentSession();
    if (refresh.ok) {
      const data = await refresh.json();
      assertCurrentSession();
      localStorage.setItem("access_token", data.access);
      headers.set("Authorization", `Bearer ${data.access}`);
      response = await fetch(`${apiUrl}${path}`, { ...init, headers });
      assertCurrentSession();
    } else expireSession();
  }
  if (response.status === 401) expireSession();
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const fieldError = Object.values(data).find(Array.isArray)?.[0];
    const error = new Error(data.detail || data.error || data.non_field_errors?.[0] || fieldError || "Request failed") as ApiError;
    error.status = response.status;
    throw error;
  }
  return (response.status === 204 ? null : await response.json()) as T;
}
