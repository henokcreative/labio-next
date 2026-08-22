import type { Metadata } from "next";
import type { CmsPageBase, CmsSiteSettings } from "./cms-types";
import { publicSiteUrl } from "./public-url";

function brandedTitle(title: string): string {
  return /labio media/i.test(title) ? title : `${title} | LaBio Media`;
}

export function pageMetadata(
  page: CmsPageBase | null,
  fallbackTitle: string,
  fallbackDescription: string,
  settings?: CmsSiteSettings | null,
  canonicalPath?: string,
): Metadata {
  const title = brandedTitle(page?.meta.seoTitle || page?.title || fallbackTitle);
  const description = page?.meta.searchDescription || fallbackDescription;
  const socialImage = page?.socialImage || settings?.defaultSocialImage;
  const canonical = canonicalPath ? publicSiteUrl(canonicalPath) : undefined;
  const images = socialImage
    ? [
        {
          url: socialImage.url,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
        },
      ]
    : undefined;

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "LaBio Media",
      locale: "en_GB",
      ...(canonical ? { url: canonical } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
