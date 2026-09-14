import type { CmsTeamMember } from "@/lib/cms-types";
import CmsImage from "./CmsImage";

export default function TeamCard({ member }: { member: CmsTeamMember }) {
  return (
    <article className="team-card">
      {member.portrait && <div className="team-card-portrait">
        <CmsImage image={member.portrait} sizes="(max-width: 700px) 90vw, 320px" />
      </div>}
      <h3>{member.name}</h3>
      <p className="team-card-role">{member.role}</p>
      {member.biography && <p className="team-card-biography">{member.biography}</p>}
      {member.professionalUrl && <a href={member.professionalUrl}>Professional profile<span className="sr-only"> of {member.name}</span></a>}
    </article>
  );
}
