import Link from "next/link";
import { projects } from "@/data/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = projects[slug];

  if (!project) {
    return (
      <main className="project-not-found">
        <h1>Project not found</h1>

        <Link href="/#work">
          ← Back to work
        </Link>
      </main>
    );
  }

  return (
    <main className="project-page">

      {/* HEADER */}

      <section className="project-header">

        <Link href="/#work" className="project-back">
          ← Back to work
        </Link>

        <div className="project-heading">

          <div className="section-label">
            {project.category}
            <span />
          </div>

          <h1>{project.title}</h1>

          <p>{project.description}</p>

        </div>

      </section>


      {/* HERO */}

      <section className="project-hero">

        <img
          src={project.hero}
          alt={project.title}
        />

      </section>


      {/* PROJECT INTRO */}

      <section className="project-information">

        <div className="project-intro">

          <div className="section-label">
            THE PROJECT
            <span />
          </div>

          <h2>
            Creating meaningful visual
            communication for research.
          </h2>

        </div>


        <div className="project-details">

          <p>
            {project.challenge}
          </p>

          <p>
            {project.approach}
          </p>

        </div>

      </section>


      {/* GALLERY */}

      <section className="project-gallery">

        <div className="section-label">
          SELECTED WORK
          <span />
        </div>

        <div className="project-gallery-grid">

          {project.images.map((image, index) => (

            <figure
              key={`${image.src}-${index}`}
              className={`project-gallery-item ${
                image.size === "large"
                  ? "gallery-large"
                  : "gallery-small"
              }`}
            >

              <img
                src={image.src}
                alt={image.alt}
              />

            </figure>

          ))}

        </div>

      </section>


      {/* SERVICES */}

      <section className="project-services">

        <div className="section-label">
          SERVICES
          <span />
        </div>

        <div className="service-list">

          {project.services.map((service) => (
            <div key={service}>
              {service}
            </div>
          ))}

        </div>

      </section>


      {/* NEXT */}

      <section className="project-next">

        <div className="section-label">
          CONTINUE EXPLORING
          <span />
        </div>

        <Link href="/#work">
          View all work →
        </Link>

      </section>

    </main>
  );
}
