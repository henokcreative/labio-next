import "server-only";

import { cache } from "react";
import {
  parseAboutPage,
  parseArticlePage,
  parseCaseStudyPage,
  parseCollaborators,
  parseContactPage,
  parseEventPage,
  parseHomePage,
  parsePortfolioIndexPage,
  parsePricingPage,
  parseServiceIndexPage,
  parseServicePage,
  parseSiteSettings,
  parseStandardPage,
  parseTestimonials,
  parseUpdatesIndexPage,
} from "./cms-parse";
import type {
  CmsAboutPage,
  CmsArticlePage,
  CmsCaseStudyPage,
  CmsCollaborator,
  CmsContactPage,
  CmsEventPage,
  CmsHomePage,
  CmsPortfolioIndexPage,
  CmsPricingPage,
  CmsServiceIndexPage,
  CmsServicePage,
  CmsSiteSettings,
  CmsStandardPage,
  CmsTestimonial,
  CmsUpdatePage,
  CmsUpdatesIndexPage,
} from "./cms-types";

const CMS_REVALIDATE_SECONDS = 60;
const CMS_REQUEST_TIMEOUT_MS = 5000;

export type CmsCollectionResult<T> = {
  items: T[];
  apiAvailable: boolean;
};

function getCmsApiBaseUrl(): string | null {
  const configured = process.env.CMS_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

async function cmsRequest(
  path: string,
  parameters?: Record<string, string>,
): Promise<unknown | null> {
  const baseUrl = getCmsApiBaseUrl();
  if (!baseUrl) return null;

  const url = new URL(path.replace(/^\/+/, ""), `${baseUrl}/`);
  for (const [key, value] of Object.entries(parameters ?? {})) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: CMS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(CMS_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function getPageItemsResult<T>(
  type: string,
  parser: (value: unknown, baseUrl: string) => T | null,
  slug?: string,
): Promise<CmsCollectionResult<T>> {
  const baseUrl = getCmsApiBaseUrl();
  if (!baseUrl) return { items: [], apiAvailable: false };

  const items: T[] = [];
  let apiAvailable = false;
  const pageSize = 20;
  for (let offset = 0; offset < 1000; offset += pageSize) {
    const raw = await cmsRequest("api/cms/v2/pages/", {
      type,
      fields: "*",
      limit: String(pageSize),
      offset: String(offset),
      ...(slug ? { slug } : {}),
    });
    if (raw === null) break;
    apiAvailable = true;

    const listing =
      raw !== null && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : null;
    const rawItems = Array.isArray(listing?.items) ? listing.items : [];
    const pageItems = rawItems
      .map((item) => parser(item, baseUrl))
      .filter((item): item is T => item !== null);
    items.push(...pageItems);
    if (slug || rawItems.length < pageSize) break;

    const meta =
      listing?.meta !== null && typeof listing?.meta === "object"
        ? (listing.meta as Record<string, unknown>)
        : null;
    const totalCount =
      typeof meta?.total_count === "number" ? meta.total_count : null;
    if (totalCount !== null && offset + rawItems.length >= totalCount) break;
  }

  return { items, apiAvailable };
}

async function getPageItems<T>(
  type: string,
  parser: (value: unknown, baseUrl: string) => T | null,
  slug?: string,
): Promise<T[]> {
  return (await getPageItemsResult(type, parser, slug)).items;
}

export const getHomePage = cache(async (): Promise<CmsHomePage | null> => {
  return (await getPageItems("public_content.HomePage", parseHomePage))[0] ?? null;
});

export const getServiceIndexPage = cache(
  async (): Promise<CmsServiceIndexPage | null> => {
    return (
      await getPageItems(
        "public_content.ServiceIndexPage",
        parseServiceIndexPage,
      )
    )[0] ?? null;
  },
);

export const getServicePagesResult = cache(
  async (): Promise<CmsCollectionResult<CmsServicePage>> => {
    return getPageItemsResult("public_content.ServicePage", parseServicePage);
  },
);

export const getServicePages = cache(async (): Promise<CmsServicePage[]> => {
  return (await getServicePagesResult()).items;
});

export const getServicePageResult = cache(
  async (
    slug: string,
  ): Promise<{ page: CmsServicePage | null; apiAvailable: boolean }> => {
    const result = await getPageItemsResult(
      "public_content.ServicePage",
      parseServicePage,
      slug,
    );
    return {
      page: result.items[0] ?? null,
      apiAvailable: result.apiAvailable,
    };
  },
);

export const getServicePage = cache(
  async (slug: string): Promise<CmsServicePage | null> => {
    return (await getServicePageResult(slug)).page;
  },
);

export const getPortfolioIndexPage = cache(
  async (): Promise<CmsPortfolioIndexPage | null> => {
    return (
      await getPageItems(
        "public_content.PortfolioIndexPage",
        parsePortfolioIndexPage,
      )
    )[0] ?? null;
  },
);

export const getCaseStudyPages = cache(async (): Promise<CmsCaseStudyPage[]> => {
  return getPageItems("public_content.CaseStudyPage", parseCaseStudyPage);
});

export const getCaseStudyPage = cache(
  async (slug: string): Promise<CmsCaseStudyPage | null> => {
    return (
      await getPageItems("public_content.CaseStudyPage", parseCaseStudyPage, slug)
    )[0] ?? null;
  },
);

export const getAboutPage = cache(async (): Promise<CmsAboutPage | null> => {
  return (await getPageItems("public_content.AboutPage", parseAboutPage))[0] ?? null;
});

export const getPricingPage = cache(async (): Promise<CmsPricingPage | null> => {
  return (
    await getPageItems("public_content.PricingPage", parsePricingPage)
  )[0] ?? null;
});

export const getUpdatesIndexPage = cache(
  async (): Promise<CmsUpdatesIndexPage | null> => {
    return (
      await getPageItems(
        "public_content.UpdatesIndexPage",
        parseUpdatesIndexPage,
      )
    )[0] ?? null;
  },
);

export const getArticlePage = cache(
  async (slug: string): Promise<CmsArticlePage | null> => {
    return (
      await getPageItems("public_content.ArticlePage", parseArticlePage, slug)
    )[0] ?? null;
  },
);

export const getEventPage = cache(
  async (slug: string): Promise<CmsEventPage | null> => {
    return (
      await getPageItems("public_content.EventPage", parseEventPage, slug)
    )[0] ?? null;
  },
);

export const getUpdatePage = cache(
  async (slug: string): Promise<CmsUpdatePage | null> => {
    const [article, event] = await Promise.all([
      getArticlePage(slug),
      getEventPage(slug),
    ]);
    return article ?? event;
  },
);

export const getStandardPage = cache(
  async (slug: string): Promise<CmsStandardPage | null> => {
    return (
      await getPageItems("public_content.StandardPage", parseStandardPage, slug)
    )[0] ?? null;
  },
);

export const getContactPage = cache(async (): Promise<CmsContactPage | null> => {
  return (
    await getPageItems("public_content.ContactPage", parseContactPage)
  )[0] ?? null;
});

export const getStandardPages = cache(async (): Promise<CmsStandardPage[]> => {
  return getPageItems("public_content.StandardPage", parseStandardPage);
});

export const getCollaborators = cache(async (): Promise<CmsCollaborator[]> => {
  const baseUrl = getCmsApiBaseUrl();
  if (!baseUrl) return [];
  return parseCollaborators(
    await cmsRequest("api/cms/v2/collaborators/"),
    baseUrl,
  );
});

export const getTestimonials = cache(async (): Promise<CmsTestimonial[]> => {
  const baseUrl = getCmsApiBaseUrl();
  if (!baseUrl) return [];
  return parseTestimonials(
    await cmsRequest("api/cms/v2/testimonials/"),
    baseUrl,
  );
});

export const getSiteSettings = cache(async (): Promise<CmsSiteSettings | null> => {
  const baseUrl = getCmsApiBaseUrl();
  if (!baseUrl) return null;
  return parseSiteSettings(
    await cmsRequest("api/cms/v2/settings/"),
    baseUrl,
  );
});
