import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsImage from "@/app/components/CmsImage";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import Testimonials from "@/app/components/Testimonials";
import WorkGrid from "@/app/components/WorkGrid";
import { findFallbackService } from "@/data/public-fallbacks";
import {
  getCaseStudyPages,
  getServicePage,
  getSiteSettings,
  getTestimonials,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

type ServiceRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getServicePage(slug),
    getSiteSettings(),
  ]);
  const resolved = page ?? findFallbackService(slug);
  return pageMetadata(
    resolved,
    "Service — LaBio Media",
    resolved?.summary || "LaBio Media services for research communication.",
    settings,
    `/services/${slug}`,
  );
}

export default async function ServicePage({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const [cmsPage, allProjects, allTestimonials, settings] = await Promise.all([
    getServicePage(slug),
    getCaseStudyPages(),
    getTestimonials(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? findFallbackService(slug);
  if (!page) notFound();

  const relatedIds = new Set(page.relatedCaseStudies.map((project) => project.id));
  const relatedProjects = allProjects.filter((project) => relatedIds.has(project.id));
  const testimonials = allTestimonials.filter(
    (testimonial) => testimonial.relatedService?.id === page.id,
  );

  return (
    <PublicShell>
      <header className="public-page-header service-detail-header">
        <div className="eyebrow">What we do <span /></div>
        <h1>{page.title}</h1>
        <p className="public-page-lead">{page.summary}</p>
      </header>

      {page.heroImage && (
        <div className="public-hero-image">
          <CmsImage
            image={page.heroImage}
            priority
            sizes="(max-width: 900px) 100vw, calc(100vw - 280px)"
          />
        </div>
      )}

      {page.body.length > 0 && (
        <section className="public-content-section service-editorial-body">
          <StreamFieldRenderer blocks={page.body} />
        </section>
      )}

      {page.capabilities.length > 0 && (
        <section className="editorial-list-section">
          <div className="section-label">Capabilities <span /></div>
          <div className="editorial-list-grid">
            {page.capabilities.map((capability, index) => (
              <article key={capability.id || capability.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{capability.title}</h2>
                {capability.description && <p>{capability.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {page.process.length > 0 && (
        <section className="editorial-list-section editorial-list-muted">
          <div className="section-label">Process <span /></div>
          <div className="editorial-list-grid">
            {page.process.map((step, index) => (
              <article key={step.id || step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <Testimonials testimonials={testimonials} />

      {relatedProjects.length > 0 && (
        <section className="public-list-section related-work-section">
          <div className="section-label">Related work <span /></div>
          <WorkGrid projects={relatedProjects} variant="related" headingLevel="h2" />
        </section>
      )}

      {page.cta.label && page.cta.url && (
        <section className="public-cta">
          <h2>Have a project in mind?</h2>
          <a className="button button-dark" href={page.cta.url}>{page.cta.label}</a>
        </section>
      )}
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
