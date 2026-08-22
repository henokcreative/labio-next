import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BusinessIdentity from "@/app/components/BusinessIdentity";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import { findFallbackStandardPage } from "@/data/legal-fallbacks";
import { isBusinessIdentityLegalPage } from "@/lib/business-identity";
import { getSiteSettings, getStandardPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";
import { resolveStandardPage } from "@/lib/public-content";

type StandardRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: StandardRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getStandardPage(slug),
    getSiteSettings(),
  ]);
  const fallbackPage = findFallbackStandardPage(slug);
  const resolvedPage = resolveStandardPage(page, fallbackPage);
  return pageMetadata(
    resolvedPage,
    fallbackPage?.meta.seoTitle || "LaBio Media",
    fallbackPage?.meta.searchDescription || "Information from LaBio Media.",
    settings,
    `/${slug}`,
  );
}

export default async function StandardPage({ params }: StandardRouteProps) {
  const { slug } = await params;
  const [cmsPage, settings] = await Promise.all([
    getStandardPage(slug),
    getSiteSettings(),
  ]);
  const page = resolveStandardPage(
    cmsPage,
    findFallbackStandardPage(slug),
  );
  if (!page) notFound();

  return (
    <PublicShell>
      <header className="public-page-header standard-page-header">
        <div className="eyebrow">LaBio Media <span /></div>
        <h1>{page.title}</h1>
      </header>
      <section className="public-content-section standard-content">
        {isBusinessIdentityLegalPage(slug) && (
          <BusinessIdentity
            label={slug === "privacy" ? "Data controller" : "Business details"}
            settings={settings}
          />
        )}
        <StreamFieldRenderer blocks={page.body} />
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
