import { publicationPdfUrl } from "../../../../lib/publication-pdf-url";

export const runtime = "nodejs";

function failure(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request): Promise<Response> {
  let url = publicationPdfUrl(new URL(request.url).searchParams.get("url"));
  if (!url) return failure(400, "Invalid publication PDF URL.");
  const headers = new Headers({ Accept: "application/pdf", "Accept-Encoding": "identity" });
  const range = request.headers.get("range");
  if (range) {
    if (!/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return failure(400, "Invalid PDF range.");
    headers.set("Range", range);
    const ifRange = request.headers.get("if-range");
    if (ifRange) headers.set("If-Range", ifRange);
  }
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(120_000)]);
  try {
    // Follow redirects manually so an allowed host cannot redirect this proxy
    // to an arbitrary/internal destination. Never forward browser credentials.
    for (let redirects = 0; redirects <= 5; redirects++) {
      const upstream = await fetch(url, { headers, redirect: "manual", cache: "no-store", signal });
      if ([301, 302, 303, 307, 308].includes(upstream.status)) {
        const location = upstream.headers.get("location");
        await upstream.body?.cancel();
        if (!location) return failure(502, "Invalid PDF redirect.");
        url = publicationPdfUrl(new URL(location, url).href);
        if (!url) return failure(403, "PDF redirect is not allowed.");
        continue;
      }
      if (upstream.status === 416) {
        await upstream.body?.cancel();
        const response = failure(416, "PDF range is not satisfiable.");
        const contentRange = upstream.headers.get("content-range");
        if (contentRange) response.headers.set("Content-Range", contentRange);
        return response;
      }
      if (upstream.status !== 200 && upstream.status !== 206) {
        await upstream.body?.cancel();
        return failure(upstream.status === 404 ? 404 : 502, "Publication PDF could not be retrieved.");
      }
      const type = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      const encoding = upstream.headers.get("content-encoding");
      if (!["application/pdf", "application/octet-stream"].includes(type ?? "")
        || (encoding && encoding !== "identity")
        || (upstream.status === 206 && !upstream.headers.has("content-range"))) {
        await upstream.body?.cancel();
        return failure(502, "Unexpected PDF response.");
      }
      const responseHeaders = new Headers({
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Cache-Control": "no-store",
      });
      for (const name of ["Content-Length", "Accept-Ranges", "ETag", "Last-Modified", "Content-Range"]) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders.set(name, value);
      }
      return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    }
    return failure(502, "Too many PDF redirects.");
  } catch {
    return failure(signal.aborted ? 504 : 502, "Publication PDF is temporarily unavailable.");
  }
}
