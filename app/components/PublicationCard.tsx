import Link from "next/link";
import type { CmsPublication } from "@/lib/cms-types";
import CmsImage from "./CmsImage";

export default function PublicationCard({ publication }: { publication: CmsPublication }) {
  return (
    <article className="publication-card" aria-labelledby={`publication-${publication.id}`}>
      {publication.coverImage && (
        <Link className="publication-cover" href={`/publications/${encodeURIComponent(publication.slug)}`} aria-label={`Open ${publication.title}`}>
          <CmsImage image={publication.coverImage} sizes="(max-width: 600px) 85vw, (max-width: 1100px) 40vw, 28vw" />
        </Link>
      )}
      <h2 id={`publication-${publication.id}`}>{publication.title}</h2>
      <p className="publication-year">PRINT DESIGN{publication.publicationYear !== null && ` · ${publication.publicationYear}`}</p>
      {publication.shortDescription && (
        <p className="publication-description">{publication.shortDescription}</p>
      )}
      <Link className="publication-action" href={`/publications/${encodeURIComponent(publication.slug)}`}>
        Open publication <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
