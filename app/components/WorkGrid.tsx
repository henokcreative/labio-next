import Link from "next/link";
import CmsImage from "./CmsImage";
import type { CmsCaseStudyPage } from "@/lib/cms-types";

export default function WorkGrid({ projects }: { projects: CmsCaseStudyPage[] }) {
  if (projects.length === 0) {
    return <p className="cms-empty">New case studies are being prepared.</p>;
  }

  return (
    <div className="work-grid">
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
                sizes="(max-width: 900px) 100vw, 33vw"
              />
            )}
          </div>
          <div className="work-card-body">
            <div className="work-index">{String(index + 1).padStart(2, "0")}</div>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            {project.category && (
              <div className="work-tags">
                <span>{project.category}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
