import CmsImage from "./CmsImage";
import type { CmsCollaborator } from "@/lib/cms-types";

function CollaboratorItems({
  collaborators,
  duplicate = false,
}: {
  collaborators: CmsCollaborator[];
  duplicate?: boolean;
}) {
  return collaborators.map((collaborator) => (
    <a
      className="collaborator-item"
      key={(duplicate ? "duplicate-" : "") + collaborator.id}
      href={collaborator.url}
      target="_blank"
      rel="noreferrer"
      tabIndex={duplicate ? -1 : undefined}
    >
      <CmsImage image={collaborator.logo} sizes="180px" />
      <span className="sr-only">{collaborator.organizationName}</span>
    </a>
  ));
}

export default function CollaboratorsSlider({
  collaborators,
}: {
  collaborators: CmsCollaborator[];
}) {
  if (collaborators.length === 0) return null;

  return (
    <section className="collaborators-section" aria-labelledby="collaborators-title">
      <div className="collaborators-heading">
        <span id="collaborators-title">Trusted by &amp; collaborating with</span>
      </div>
      <div className="collaborators-viewport">
        <div className="collaborators-track">
          <div className="collaborators-row">
            <CollaboratorItems collaborators={collaborators} />
          </div>
          <div className="collaborators-row" aria-hidden="true">
            <CollaboratorItems collaborators={collaborators} duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}
