import Link from "next/link";
import CmsImage from "./CmsImage";
import type { CmsCaseStudyPage } from "@/lib/cms-types";

type WorkGridVariant = "featured" | "portfolio" | "related";

export default function WorkGrid({
  projects,
  variant = "portfolio",
  headingLevel = "h3",
}: {
  projects: CmsCaseStudyPage[];
  variant?: WorkGridVariant;
  headingLevel?: "h2" | "h3";
}) {
  if (projects.length === 0) {
    return <p className="cms-empty">New case studies are being prepared.</p>;
  }

  const Heading = headingLevel;
  const sizes = variant === "portfolio"
    ? "(max-width: 900px) 100vw, 50vw"
    : "(max-width: 900px) 100vw, 33vw";

  return (
    <div className={`work-grid work-grid-${variant}`}>
      {projects.map((project, index) => (
        <Link
          href={"/work/" + project.meta.slug}
          className="work-card"
          key={project.id}
        >
          <div className="work-image">
            {project.heroImage && (
              <CmsImage
                image={project.heroImage}
                sizes={sizes}
              />
            )}
          </div>
          <div className="work-card-body">
            <div className="work-meta">
              <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
              {project.category && <span className="work-category">{project.category}</span>}
            </div>
            <Heading>{project.title}</Heading>
            {project.summary && <p>{project.summary}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
