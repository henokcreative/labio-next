import type { CmsPublication } from "@/lib/cms-types";
import PublicationCard from "./PublicationCard";

export default function PublicationGrid({ publications }: { publications: CmsPublication[] }) {
  if (publications.length === 0) {
    return <p className="publications-empty">Publications are being prepared.</p>;
  }

  return (
    <div className="publication-grid">
      {publications.map((publication) => (
        <PublicationCard key={publication.id} publication={publication} />
      ))}
    </div>
  );
}
