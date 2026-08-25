import type { NextConfig } from "next";

const DEFAULT_CMS_MEDIA_URL =
  "https://media.labiomedia.com/labio-cms-media-production/cms";

function publicMediaPattern(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") + "/**";
    return url;
  } catch {
    return null;
  }
}

function apiMediaPattern(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    return publicMediaPattern(new URL("/media", value).toString());
  } catch {
    return null;
  }
}

const cmsApiUrl = process.env.CMS_API_URL || process.env.NEXT_PUBLIC_API_URL;
const apiMedia = apiMediaPattern(cmsApiUrl);
const configuredMediaPattern = publicMediaPattern(process.env.CMS_MEDIA_URL);
const defaultMediaPattern = publicMediaPattern(DEFAULT_CMS_MEDIA_URL);
const remotePatterns = [
  apiMedia,
  configuredMediaPattern,
  defaultMediaPattern,
].filter(
  (pattern): pattern is URL => pattern !== null,
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
