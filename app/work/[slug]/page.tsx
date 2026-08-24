import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CaseStudyShowcase from "@/app/components/CaseStudyShowcase";
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
import { shouldUseLegacyCaseStudyMedia } from "@/lib/case-study-showcase";

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
    `/work/${slug}`,
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
  const hasContext = Boolean(
    project.clientDisplayName || project.projectYear || project.category || project.projectUrl,
  );
  const hasNarrative = Boolean(
    project.challenge
      || project.approach
      || project.deliverables.length
      || project.outcome,
  );
  const useLegacyMedia = shouldUseLegacyCaseStudyMedia(project.showcase);

  return (
    <PublicShell>
      <article className="project-page">
        <header className="project-header">
          <Link href="/work" className="project-back">← Back to work</Link>
          <div className="project-heading">
            {project.category && (
              <div className="section-label">{project.category}<span /></div>
            )}
            <h1>{project.title}</h1>
            {project.summary && <p>{project.summary}</p>}
            {hasContext && (
              <dl className="case-study-context">
                {project.clientDisplayName && (
                  <div><dt>Client</dt><dd>{project.clientDisplayName}</dd></div>
                )}
                {project.projectYear && (
                  <div><dt>Year</dt><dd>{project.projectYear}</dd></div>
                )}
                {project.category && (
                  <div><dt>Context</dt><dd>{project.category}</dd></div>
                )}
                {project.projectUrl && (
                  <div>
                    <dt>Project</dt>
                    <dd>
                      <a href={project.projectUrl} target="_blank" rel="noreferrer">
                        Visit project ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
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

        {hasNarrative && (
          <section className="case-study-narrative" aria-label="Case study">
            {project.challenge && (
              <article>
                <h2>Challenge</h2>
                <p>{project.challenge}</p>
              </article>
            )}
            {project.approach && (
              <article>
                <h2>Approach</h2>
                <p>{project.approach}</p>
              </article>
            )}
            {project.deliverables.length > 0 && (
              <article>
                <h2>Deliverables</h2>
                <ul>
                  {project.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </article>
            )}
            {project.outcome && (
              <article>
                <h2>Outcome</h2>
                <p>{project.outcome}</p>
              </article>
            )}
          </section>
        )}

        {project.body.length > 0 && (
          <section className="project-information cms-project-body">
            <div className="project-intro">
              <div className="section-label">Project story <span /></div>
            </div>
            <StreamFieldRenderer blocks={project.body} className="project-details" />
          </section>
        )}

        {project.showcase.length > 0 && (
          <CaseStudyShowcase blocks={project.showcase} />
        )}

        {useLegacyMedia && project.embedUrl && (
          <section className="public-content-section">
            <StreamFieldRenderer blocks={[{ type: "embed", value: project.embedUrl }]} />
          </section>
        )}

        {useLegacyMedia && project.gallery.length > 0 && (
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

        {project.cta.label && project.cta.url && (
          <section className="case-study-cta">
            <div className="section-label">Enquiries <span /></div>
            <a href={project.cta.url}>{project.cta.label} <span aria-hidden="true">→</span></a>
          </section>
        )}

        <section className="project-next">
          <div className="section-label">Continue exploring <span /></div>
          <Link href="/work">View all work →</Link>
        </section>
      </article>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
