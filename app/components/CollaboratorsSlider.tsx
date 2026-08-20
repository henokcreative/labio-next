import CmsImage from "./CmsImage";
import type { CmsCollaborator } from "@/lib/cms-types";

function CollaboratorItems({ collaborators }: { collaborators: CmsCollaborator[] }) {
  return collaborators.map((collaborator) => (
    <a
      className="collaborator-item"
      key={collaborator.id}
      href={collaborator.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${collaborator.organizationName} website`}
    >
      <CmsImage image={collaborator.logo} sizes="180px" />
      <span className="sr-only">{collaborator.organizationName}</span>
    </a>
  ));
}

export default function CollaboratorsSlider({
  collaborators,
  heading,
}: {
  collaborators: CmsCollaborator[];
  heading: string;
}) {
  if (collaborators.length === 0) return null;

  return (
    <section className="collaborators-section" aria-labelledby="collaborators-title">
      <h2 className="collaborators-heading" id="collaborators-title">
        {heading}
      </h2>
      <div className="collaborators-grid">
        <CollaboratorItems collaborators={collaborators} />
      </div>
    </section>
  );
}
