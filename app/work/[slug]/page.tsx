import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CaseStudyShowcase from "@/app/components/CaseStudyShowcase";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
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

        {hasNarrative && (
          <section className="case-study-narrative" aria-labelledby="project-story-heading">
            <h2 id="project-story-heading" className="section-label case-study-story-label">
              Project story <span />
            </h2>
            {project.challenge && (
              <article>
                <h3>Challenge</h3>
                <p>{project.challenge}</p>
              </article>
            )}
            {project.approach && (
              <article>
                <h3>Approach</h3>
                <p>{project.approach}</p>
              </article>
            )}
            {project.deliverables.length > 0 && (
              <article>
                <h3>Deliverables</h3>
                <ul>
                  {project.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </article>
            )}
            {project.outcome && (
              <article>
                <h3>Outcome</h3>
                <p>{project.outcome}</p>
              </article>
            )}
          </section>
        )}

        {project.showcase.length > 0 && (
          <CaseStudyShowcase blocks={project.showcase} />
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
