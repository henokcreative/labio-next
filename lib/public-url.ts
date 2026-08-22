const DEFAULT_PUBLIC_SITE_URL = "https://labiomedia.com";

export function publicSiteUrl(path = "/"): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PUBLIC_SITE_URL;
  let base: URL;

  try {
    base = new URL(configured);
    if (base.protocol !== "http:" && base.protocol !== "https:") {
      throw new Error("Unsupported public site URL protocol");
    }
  } catch {
    base = new URL(DEFAULT_PUBLIC_SITE_URL);
  }

  base.pathname = "/";
  base.search = "";
  base.hash = "";
  return new URL(path, base).toString();
}
