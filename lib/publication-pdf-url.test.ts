import assert from "node:assert/strict";
import test from "node:test";
import { publicationPdfUrl } from "./publication-pdf-url";
import { GET } from "../app/api/publications/pdf/route";

const upstreamUrl = "https://api.labiomedia.com/documents/1/report.pdf";
const request = (headers?: HeadersInit) => new Request(`https://labiomedia.com/api/publications/pdf?${new URLSearchParams({ url: upstreamUrl })}`, { headers });

test("PDF allowlist rejects arbitrary hosts, credentials, ports and schemes", () => {
  for (const value of [null, "", "/file.pdf", "file:///etc/passwd", "https://localhost/a.pdf", "https://api.labiomedia.com.evil.test/a.pdf", "https://user:pass@api.labiomedia.com/a.pdf", "https://media.labiomedia.com:8080/a.pdf", "javascript:alert(1)"]) {
    assert.equal(publicationPdfUrl(value), null);
  }
  assert.ok(publicationPdfUrl(upstreamUrl));
  assert.ok(publicationPdfUrl("http://media.labiomedia.com/report.pdf"));
});

test("proxy validates redirects and streams partial PDF with range headers", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (_url: URL, options: RequestInit) => {
    calls++;
    const headers = new Headers(options.headers);
    assert.equal(headers.get("cookie"), null);
    assert.equal(headers.get("authorization"), null);
    assert.equal(headers.get("range"), "bytes=0-3");
    assert.equal(options.redirect, "manual");
    return calls === 1
      ? new Response(null, { status: 302, headers: { Location: "https://media.labiomedia.com/report.pdf" } })
      : new Response("%PDF", { status: 206, headers: { "Content-Type": "application/pdf", "Content-Length": "4", "Content-Range": "bytes 0-3/100", "Accept-Ranges": "bytes", ETag: '"pdf"' } });
  });
  const response = await GET(request({ Range: "bytes=0-3", Cookie: "private=value", Authorization: "Bearer private" }));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-3/100");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("content-length"), "4");
  assert.equal(response.headers.get("content-disposition"), "inline");
  assert.equal(response.headers.get("etag"), '"pdf"');
  assert.equal(await response.text(), "%PDF");
});

test("proxy rejects redirect escapes without fetching them", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return new Response(null, { status: 302, headers: { Location: "http://127.0.0.1/private" } });
  });
  assert.equal((await GET(request())).status, 403);
  assert.equal(calls, 1);
});

test("upstream failures are sanitized; unsatisfiable ranges retain status", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => { throw new Error("internal secret"); });
  const failed = await GET(request());
  assert.equal(failed.status, 502);
  assert.doesNotMatch(await failed.text(), /internal secret/);
  mock.mock.mockImplementation(async () => new Response(null, { status: 416, headers: { "Content-Range": "bytes */100" } }));
  const range = await GET(request({ Range: "bytes=1000-" }));
  assert.equal(range.status, 416);
  assert.equal(range.headers.get("content-range"), "bytes */100");
});
