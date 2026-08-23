import type { MetadataRoute } from "next";
import { fallbackCaseStudies, fallbackServices } from "@/data/public-fallbacks";
import {
  getCaseStudyPages,
  getServicePagesResult,
  getStandardPages,
  getUpdatesIndexPage,
} from "@/lib/cms";
import { resolveCmsCollection } from "@/lib/public-content";
import { publicSiteUrl } from "@/lib/public-url";

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
): SitemapEntry {
  return { url: publicSiteUrl(path), changeFrequency, priority };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [serviceResult, cmsCaseStudies, standardPages, updates] = await Promise.all([
    getServicePagesResult(),
    getCaseStudyPages(),
    getStandardPages(),
    getUpdatesIndexPage(),
  ]);
  const services = resolveCmsCollection(serviceResult, fallbackServices);
  const caseStudies = cmsCaseStudies.length > 0 ? cmsCaseStudies : fallbackCaseStudies;

  const entries: SitemapEntry[] = [
    entry("/", "weekly", 1),
    entry("/services", "monthly", 0.9),
    entry("/work", "monthly", 0.9),
    entry("/about", "monthly", 0.8),
    entry("/pricing", "monthly", 0.8),
    entry("/contact", "yearly", 0.7),
    entry("/updates", "weekly", 0.8),
    entry("/privacy", "yearly", 0.3),
    entry("/cookies", "yearly", 0.3),
    entry("/terms", "yearly", 0.3),
    ...services.map((service) =>
      entry(`/services/${service.meta.slug}`, "monthly", 0.7),
    ),
    ...caseStudies.map((caseStudy) =>
      entry(`/work/${caseStudy.meta.slug}`, "monthly", 0.7),
    ),
    ...standardPages.map((page) => entry(`/${page.meta.slug}`, "yearly", 0.4)),
    ...(updates
      ? [...updates.articles, ...updates.upcomingEvents, ...updates.pastEvents].map(
          (update) => entry(`/updates/${update.slug}`, "monthly", 0.6),
        )
      : []),
  ];

  return [...new Map(entries.map((item) => [item.url, item])).values()];
}
