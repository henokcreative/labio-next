import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CmsImage from "@/app/components/CmsImage";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import { getSiteSettings, getUpdatePage } from "@/lib/cms";
import type { CmsEventPage, CmsUpdatePage } from "@/lib/cms-types";
import { pageMetadata } from "@/lib/public-metadata";
import { publicSiteUrl } from "@/lib/public-url";
import {
  formatEventSchedule,
  formatPublicDate,
  updateMachineDate,
  updateTypeLabel,
} from "@/lib/public-updates";

type UpdateRouteProps = { params: Promise<{ slug: string }> };

function canonicalUrl(slug: string): string {
  return publicSiteUrl(`/updates/${slug}`);
}

function siteRootUrl(): string {
  return publicSiteUrl("/");
}

function eventDateTime(date: string, time?: string): string {
  return time ? `${date}T${time}` : date;
}

function updateJsonLd(page: CmsUpdatePage): Record<string, unknown> {
  const url = canonicalUrl(page.meta.slug);
  const image = page.featuredImage ? [page.featuredImage.url] : undefined;

  if (page.kind === "article") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.summary,
      datePublished: page.publicationDate,
      mainEntityOfPage: url,
      url,
      ...(image ? { image } : {}),
      publisher: { "@type": "Organization", name: "LaBio Media" },
    };
  }

  const effectiveEndDate = page.endDate || page.startDate;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: page.title,
    description: page.summary,
    startDate: eventDateTime(page.startDate, page.startTime),
    ...(page.endDate || page.endTime
      ? { endDate: eventDateTime(effectiveEndDate, page.endTime) }
      : {}),
    url: page.registrationUrl || url,
    ...(image ? { image } : {}),
    ...(page.location
      ? { location: { "@type": "Place", name: page.location } }
      : {}),
    organizer: { "@type": "Organization", name: "LaBio Media", url: siteRootUrl() },
  };
}

export async function generateMetadata({ params }: UpdateRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getUpdatePage(slug),
    getSiteSettings(),
  ]);
  const canonical = canonicalUrl(page?.meta.slug || slug);
  const metadata = pageMetadata(
    page,
    "Updates — LaBio Media",
    page?.summary || "An update from LaBio Media.",
    settings,
    canonical,
  );

  return {
    ...metadata,
    openGraph: page?.kind === "article"
      ? {
          ...metadata.openGraph,
          type: "article",
          url: canonical,
          publishedTime: page.publicationDate,
        }
      : { ...metadata.openGraph, type: "website", url: canonical },
  };
}

function EventInformation({ event }: { event: CmsEventPage }) {
  return (
    <aside className="event-information" aria-label="Event information">
      <dl>
        <div>
          <dt>Date</dt>
          <dd><time dateTime={eventDateTime(event.startDate, event.startTime)}>{formatEventSchedule(event)}</time></dd>
        </div>
        {event.location && (
          <div>
            <dt>Location</dt>
            <dd>{event.location}</dd>
          </div>
        )}
      </dl>
      {event.registrationUrl && (
        <a className="button button-dark" href={event.registrationUrl}>
          Registration details
        </a>
      )}
    </aside>
  );
}

export default async function UpdateDetailPage({ params }: UpdateRouteProps) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getUpdatePage(slug),
    getSiteSettings(),
  ]);
  if (!page) notFound();

  const jsonLd = updateJsonLd(page);
  const displayDate = page.kind === "article"
    ? formatPublicDate(page.publicationDate)
    : formatEventSchedule(page);

  return (
    <PublicShell>
      <article className="update-detail">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <header className="update-detail-header">
          <Link href="/updates" className="update-back">← Back to updates</Link>
          <div className="update-detail-meta">
            <span>{updateTypeLabel(page)}</span>
            <time dateTime={updateMachineDate(page)}>{displayDate}</time>
          </div>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
        </header>

        {page.featuredImage && (
          <div className="update-detail-image">
            <CmsImage
              image={page.featuredImage}
              priority
              sizes="(max-width: 900px) 100vw, calc(100vw - 280px)"
            />
          </div>
        )}

        {page.kind === "event" && <EventInformation event={page} />}

        {page.body.length > 0 && (
          <section className="public-content-section update-detail-body">
            <StreamFieldRenderer blocks={page.body} />
          </section>
        )}

        <nav className="update-detail-next" aria-label="Updates navigation">
          <Link href="/updates">View all updates →</Link>
        </nav>
      </article>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
