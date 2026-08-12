const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiError = Error & { status?: number };

export function clearTokens() {
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
  const headers = new Headers(init.headers);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (!(init.body instanceof FormData) && init.body) headers.set("Content-Type", "application/json");
  let response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  if (response.status === 401 && localStorage.getItem("refresh_token")) {
    const refresh = await fetch(`${apiUrl}/api/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }) });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem("access_token", data.access);
      headers.set("Authorization", `Bearer ${data.access}`);
      response = await fetch(`${apiUrl}${path}`, { ...init, headers });
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
