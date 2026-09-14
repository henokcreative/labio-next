import type { CmsTeamMember } from "@/lib/cms-types";
import TeamCard from "./TeamCard";

export default function TeamMembers({ members, heading }: { members: CmsTeamMember[]; heading: string }) {
  if (!members.length) return null;
  return (
    <section className="team-section" aria-labelledby="team-heading">
      <h2 className="section-label" id="team-heading">{heading} <span /></h2>
      <div className="team-grid">{members.map((member) => <TeamCard key={member.id} member={member} />)}</div>
    </section>
  );
}
