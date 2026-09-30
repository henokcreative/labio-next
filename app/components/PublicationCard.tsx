import Link from "next/link";
import type { CmsPublication } from "@/lib/cms-types";
import CmsImage from "./CmsImage";

export default function PublicationCard({ publication }: { publication: CmsPublication }) {
  return (
    <article className="publication-card" aria-labelledby={`publication-${publication.id}`}>
      {publication.coverImage && (
        <div className="publication-cover">
          <CmsImage image={publication.coverImage} sizes="(max-width: 600px) 85vw, (max-width: 1100px) 40vw, 28vw" />
        </div>
      )}
      {publication.publicationYear !== null && (
        <p className="publication-year">{publication.publicationYear}</p>
      )}
      <h2 id={`publication-${publication.id}`}>{publication.title}</h2>
      {publication.shortDescription && (
        <p className="publication-description">{publication.shortDescription}</p>
      )}
      <Link className="publication-action" href={`/publications/${encodeURIComponent(publication.slug)}`}>
        Open publication <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
