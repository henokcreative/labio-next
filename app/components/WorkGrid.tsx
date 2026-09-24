import Link from "next/link";
import BrandName from "./BrandName";
import type {
  CmsCaseStudyPage,
  CmsCaseStudySummary,
} from "@/lib/cms-types";

type WorkGridVariant = "featured" | "portfolio" | "related";

const trimSummary = (text: string, maxLength = 140) => {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed}…`;
};

export default function WorkGrid({
  projects,
  variant = "portfolio",
  headingLevel = "h3",
  summaryOverrides = [],
}: {
  projects: Array<CmsCaseStudyPage | CmsCaseStudySummary>;
  variant?: WorkGridVariant;
  headingLevel?: "h2" | "h3";
  summaryOverrides?: ReadonlyArray<string | undefined>;
}) {
  if (projects.length === 0) {
    return <p className="cms-empty">New case studies are being prepared.</p>;
  }

  const Heading = headingLevel;
  const countClass = `work-grid-count-${Math.min(projects.length, 6)}`;

  return (
    <div className={`work-grid work-grid-${variant} ${countClass}`}>
      {projects.map((project, index) => {
        const summary = variant === "featured"
          ? summaryOverrides[index]?.trim() || project.summary
          : project.summary;
        return (
          <Link
            href={
              "/work/" + ("slug" in project ? project.slug : project.meta.slug)
            }
            className="work-card"
            key={project.id}
          >
            <div className="work-image">
              <div className="work-brand-badge">
                <BrandName variant="auto" />
              </div>
            </div>
            <div className="work-card-body">
              <div className="work-meta">
                <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
                {project.category && <span className="work-category">{project.category}</span>}
              </div>
              <Heading>{project.title}</Heading>
              {summary && <p>{trimSummary(summary)}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
