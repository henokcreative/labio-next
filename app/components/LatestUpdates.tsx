import Link from "next/link";
import type { CmsHomePage } from "@/lib/cms-types";
import { resolveHomeLatestUpdates } from "@/lib/public-content";
import {
  updateDisplayDate,
  updateMachineDate,
  updateTypeLabel,
} from "@/lib/public-updates";

export default function LatestUpdates({ home }: { home: CmsHomePage }) {
  const updates = resolveHomeLatestUpdates(home);
  if (updates.length === 0) return null;

  return (
    <section className="home-updates-section" aria-labelledby="home-updates-heading">
      <div className="home-updates-heading">
        <div>
          {home.updatesEyebrow && (
            <div className="section-label">{home.updatesEyebrow}<span /></div>
          )}
          <h2 id="home-updates-heading">{home.updatesHeading}</h2>
        </div>
        {home.updatesCta.label && home.updatesCta.url && (
          <Link className="section-link" href={home.updatesCta.url}>
            {home.updatesCta.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <ol className="home-updates-list">
        {updates.map((update) => (
          <li key={`${update.kind}-${update.id}`}>
            <Link href={`/updates/${update.slug}`}>
              <div className="home-update-meta">
                <span>{updateTypeLabel(update)}</span>
                <time dateTime={updateMachineDate(update)}>
                  {updateDisplayDate(update)}
                </time>
              </div>
              <h3>{update.title}</h3>
              <span className="home-update-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
