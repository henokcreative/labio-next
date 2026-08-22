import Link from "next/link";
import type {
  CmsUpdateSummary,
  CmsUpdatesIndexPage,
} from "@/lib/cms-types";
import {
  updateDisplayDate,
  updateMachineDate,
  updateTypeLabel,
} from "@/lib/public-updates";
import CmsImage from "./CmsImage";

function updateHref(update: CmsUpdateSummary): string {
  return `/updates/${update.slug}`;
}

function UpdateRow({
  update,
  quiet = false,
}: {
  update: CmsUpdateSummary;
  quiet?: boolean;
}) {
  return (
    <li className={quiet ? "updates-row updates-row-quiet" : "updates-row"}>
      <Link href={updateHref(update)}>
        <div className="updates-row-meta">
          <span>{updateTypeLabel(update)}</span>
          <time dateTime={updateMachineDate(update)}>{updateDisplayDate(update)}</time>
        </div>
        <div className="updates-row-copy">
          <h3>{update.title}</h3>
          <p>{update.summary}</p>
        </div>
        <span className="updates-row-arrow" aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

function UpdatesList({
  heading,
  updates,
  quiet = false,
}: {
  heading: string;
  updates: CmsUpdateSummary[];
  quiet?: boolean;
}) {
  if (updates.length === 0) return null;

  return (
    <section className={quiet ? "updates-list-section updates-archive" : "updates-list-section"}>
      <h2 className="section-label">{heading}<span /></h2>
      <ol className="updates-list">
        {updates.map((update) => (
          <UpdateRow key={`${update.kind}-${update.id}`} update={update} quiet={quiet} />
        ))}
      </ol>
    </section>
  );
}

export default function UpdatesIndex({
  page,
}: {
  page: CmsUpdatesIndexPage | null;
}) {
  const articles = page?.articles ?? [];
  const upcomingEvents = page?.upcomingEvents ?? [];
  const pastEvents = page?.pastEvents ?? [];
  const current = [...articles, ...upcomingEvents];
  const featured = current.find((item) => item.featured)
    ?? articles[0]
    ?? upcomingEvents[0]
    ?? null;
  const remainingArticles = articles.filter((item) => item.id !== featured?.id);
  const remainingEvents = upcomingEvents.filter((item) => item.id !== featured?.id);
  const isEmpty = !featured
    && remainingArticles.length === 0
    && remainingEvents.length === 0
    && pastEvents.length === 0;

  if (isEmpty) {
    return (
      <section className="updates-empty" aria-live="polite">
        <div className="section-label">Updates<span /></div>
        <h2>No updates are published yet.</h2>
        <p>New notes, milestones and events will appear here.</p>
      </section>
    );
  }

  return (
    <div className="updates-index-content">
      {featured && (
        <section className="updates-feature-section" aria-labelledby="featured-update-heading">
          <div className="section-label">Featured / latest<span /></div>
          <Link className="updates-feature" href={updateHref(featured)}>
            {featured.featuredImage && (
              <div className="updates-feature-image">
                <CmsImage
                  image={featured.featuredImage}
                  priority
                  sizes="(max-width: 900px) 100vw, 52vw"
                />
              </div>
            )}
            <div className="updates-feature-copy">
              <div className="updates-feature-meta">
                <span>{updateTypeLabel(featured)}</span>
                <time dateTime={updateMachineDate(featured)}>
                  {updateDisplayDate(featured)}
                </time>
              </div>
              <h2 id="featured-update-heading">{featured.title}</h2>
              <p>{featured.summary}</p>
              <span className="updates-feature-link">
                {featured.kind === "event" ? "View event" : "Read update"} →
              </span>
            </div>
          </Link>
        </section>
      )}

      <UpdatesList heading="Latest notes" updates={remainingArticles} />
      <UpdatesList heading="Upcoming events" updates={remainingEvents} />
      <UpdatesList heading="Past events" updates={pastEvents} quiet />
    </div>
  );
}
