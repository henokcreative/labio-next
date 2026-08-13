import type { Metadata } from "next";
import CmsImage from "@/app/components/CmsImage";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import Testimonials from "@/app/components/Testimonials";
import { fallbackAbout } from "@/data/public-fallbacks";
import { getAboutPage, getSiteSettings, getTestimonials } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getAboutPage(), getSiteSettings()]);
  return pageMetadata(
    page,
    "About — LaBio Media",
    "Scientific understanding meets creative communication at LaBio Media.",
    settings,
  );
}

export default async function AboutPage() {
  const [cmsPage, testimonials, settings] = await Promise.all([
    getAboutPage(),
    getTestimonials(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? fallbackAbout;

  return (
    <PublicShell>
      <header className="public-page-header about-page-header">
        <div>
          <div className="eyebrow">About LaBio Media <span /></div>
          <h1>{page.title}</h1>
          <p className="public-page-lead">{page.intro}</p>
        </div>
        {page.heroImage && (
          <div className="about-page-image">
            <CmsImage image={page.heroImage} priority sizes="(max-width: 900px) 100vw, 45vw" />
          </div>
        )}
      </header>

      <section className="public-content-section">
        <StreamFieldRenderer blocks={page.body} />
      </section>

      {page.values.length > 0 && (
        <section className="editorial-list-section">
          <div className="section-label">Values <span /></div>
          <div className="editorial-list-grid">
            {page.values.map((value) => (
              <article key={value.id || value.title}>
                <h2>{value.title}</h2>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {page.process.length > 0 && (
        <section className="editorial-list-section editorial-list-muted">
          <div className="section-label">How we work <span /></div>
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
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
