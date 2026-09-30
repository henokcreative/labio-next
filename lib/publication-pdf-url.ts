const PDF_HOSTS = new Set(["api.labiomedia.com", "media.labiomedia.com"]);

export function publicationPdfUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)
      || !PDF_HOSTS.has(url.hostname)
      || url.username || url.password || url.port) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}
