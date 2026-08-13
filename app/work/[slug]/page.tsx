import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CmsImage from "@/app/components/CmsImage";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import Testimonials from "@/app/components/Testimonials";
import { findFallbackCaseStudy } from "@/data/public-fallbacks";
import {
  getCaseStudyPage,
  getSiteSettings,
  getTestimonials,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

type WorkRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: WorkRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getCaseStudyPage(slug),
    getSiteSettings(),
  ]);
  const resolved = page ?? findFallbackCaseStudy(slug);
  return pageMetadata(
    resolved,
    "Work — LaBio Media",
    resolved?.summary || "A LaBio Media case study.",
    settings,
  );
}

export default async function ProjectPage({ params }: WorkRouteProps) {
  const { slug } = await params;
  const [cmsProject, allTestimonials, settings] = await Promise.all([
    getCaseStudyPage(slug),
    getTestimonials(),
    getSiteSettings(),
  ]);
  const project = cmsProject ?? findFallbackCaseStudy(slug);
  if (!project) notFound();

  const testimonials = allTestimonials.filter(
    (testimonial) => testimonial.relatedCaseStudy?.id === project.id,
  );

  return (
    <PublicShell>
      <article className="project-page">
        <header className="project-header">
          <Link href="/work" className="project-back">← Back to work</Link>
          <div className="project-heading">
            <div className="section-label">{project.category}<span /></div>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            {project.clientDisplayName && (
              <p className="project-client">For {project.clientDisplayName}</p>
            )}
          </div>
        </header>

        {project.heroImage && (
          <section className="project-hero">
            <CmsImage
              image={project.heroImage}
              priority
              sizes="(max-width: 900px) 100vw, calc(100vw - 280px)"
            />
          </section>
        )}

        <section className="project-information cms-project-body">
          <div className="project-intro">
            <div className="section-label">The project <span /></div>
            <h2>Purposeful communication, grounded in the work.</h2>
          </div>
          <StreamFieldRenderer blocks={project.body} className="project-details" />
        </section>

        {project.embedUrl && (
          <section className="public-content-section">
            <StreamFieldRenderer blocks={[{ type: "embed", value: project.embedUrl }]} />
          </section>
        )}

        {project.gallery.length > 0 && (
          <section className="project-gallery">
            <div className="section-label">Selected work <span /></div>
            <div className="project-gallery-grid">
              {project.gallery.map((image, index) => (
                <figure
                  key={image.url + index}
                  className={"project-gallery-item " + (index % 3 === 0 ? "gallery-large" : "gallery-small")}
                >
                  <div className="project-gallery-image">
                    <CmsImage
                      image={image}
                      sizes={index % 3 === 0
                        ? "(max-width: 650px) 100vw, calc(100vw - 280px)"
                        : "(max-width: 650px) 100vw, 50vw"}
                    />
                  </div>
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {project.services.length > 0 && (
          <section className="project-services">
            <div className="section-label">Services <span /></div>
            <div className="service-list">
              {project.services.map((service) => (
                <div key={service.id}>{service.title}</div>
              ))}
            </div>
          </section>
        )}

        <Testimonials testimonials={testimonials} />

        <section className="project-next">
          <div className="section-label">Continue exploring <span /></div>
          <Link href="/work">View all work →</Link>
        </section>
      </article>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
