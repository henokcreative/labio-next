import assert from "node:assert/strict";
import test from "node:test";

test("FE-01: a successful refresh arriving after logout cannot restore authentication", async (t) => {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.invalid";
  const tokens = new Map([
    ["access_token", "fake-access"],
    ["refresh_token", "fake-refresh"],
  ]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => tokens.get(key) ?? null,
      setItem: (key: string, value: string) => tokens.set(key, value),
      removeItem: (key: string) => tokens.delete(key),
    },
  });
  let finishRefresh!: (response: Response) => void;
  let refreshStarted!: () => void;
  const pendingRefresh = new Promise<Response>((resolve) => { finishRefresh = resolve; });
  const started = new Promise<void>((resolve) => { refreshStarted = resolve; });
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string) => {
    requests.push(input);
    if (input.endsWith("/api/auth/refresh/")) {
      refreshStarted();
      return pendingRefresh;
    }
    return new Response("{}", { status: 401 });
  });

  try {
    const { apiFetch, clearTokens } = await import("./api");
    const request = apiFetch("/api/auth/dashboard/");
    await started;
    clearTokens();
    assert.equal(tokens.size, 0);
    const rejected = assert.rejects(request, /Authentication session changed/);
    finishRefresh(new Response(JSON.stringify({ access: "fake-restored-access" })));
    await rejected;
    assert.equal(tokens.size, 0, "neither token may reappear after logout");
    assert.equal(requests.length, 2, "the retired request must not retry");
  } finally {
    if (storageDescriptor) Object.defineProperty(globalThis, "localStorage", storageDescriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
    if (previousApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
  }
});
