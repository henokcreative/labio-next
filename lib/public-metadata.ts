import type { Metadata } from "next";
import type { CmsPageBase, CmsSiteSettings } from "./cms-types";

export function pageMetadata(
  page: CmsPageBase | null,
  fallbackTitle: string,
  fallbackDescription: string,
  settings?: CmsSiteSettings | null,
): Metadata {
  const title = page?.meta.seoTitle || page?.title || fallbackTitle;
  const description = page?.meta.searchDescription || fallbackDescription;
  const socialImage = page?.socialImage || settings?.defaultSocialImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(socialImage
        ? {
            images: [
              {
                url: socialImage.url,
                width: socialImage.width,
                height: socialImage.height,
                alt: socialImage.alt,
              },
            ],
          }
        : {}),
    },
  };
}
