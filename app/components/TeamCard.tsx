import type { CmsTeamMember } from "@/lib/cms-types";
import CmsImage from "./CmsImage";

export default function TeamCard({ member }: { member: CmsTeamMember }) {
  const headingId = `team-member-${member.id}`;

  return (
    <article
      className="team-card"
      aria-labelledby={headingId}
    >
      {member.portrait && (
        <div className="team-card-portrait">
          <CmsImage image={member.portrait} sizes="(max-width: 900px) 140px, 180px" />
        </div>
      )}
      <h3 id={headingId}>{member.name}</h3>
      <p className="team-card-role">{member.role}</p>
      {member.biography && (
        <div className="team-card-biography">
          <p>{member.biography}</p>
        </div>
      )}
      {member.professionalUrl && (
        <a href={member.professionalUrl} target="_blank" rel="noopener noreferrer">
          Professional profile
          <span className="team-card-link-arrow" aria-hidden="true">↗</span>
          <span className="sr-only"> of {member.name} (opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}
