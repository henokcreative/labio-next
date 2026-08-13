import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import { getPricingPage, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPricingPage(), getSiteSettings()]);
  return pageMetadata(
    page,
    "Pricing — LaBio Media",
    "Editorial starting points for LaBio Media projects. Every engagement is scoped individually.",
    settings,
  );
}

export default async function PricingPage() {
  const [page, settings] = await Promise.all([getPricingPage(), getSiteSettings()]);

  return (
    <PublicShell>
      <header className="public-page-header pricing-header">
        <div className="eyebrow">Project starting points <span /></div>
        <h1>{page?.title || "Pricing"}</h1>
        <p className="public-page-lead">
          {page?.intro ||
            "Every LaBio Media project is shaped around its audience, goals and production needs."}
        </p>
      </header>

      <section className="pricing-section">
        {page && page.items.length > 0 ? (
          <div className="pricing-list">
            {page.items.map((item, index) => (
              <article className="pricing-item" key={item.id}>
                <div className="pricing-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h2>{item.title}</h2>
                  <p className="pricing-description">{item.description}</p>
                </div>
                <div>
                  <span className="pricing-guidance">Starting point</span>
                  <p className="pricing-label">{item.priceLabel}</p>
                  {item.features.length > 0 && (
                    <ul>
                      {item.features.map((feature) => <li key={feature}>{feature}</li>)}
                    </ul>
                  )}
                  {item.cta.label && item.cta.url && (
                    <a className="text-link" href={item.cta.url}>
                      {item.cta.label} <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pricing-empty">
            <h2>Let’s scope the right approach.</h2>
            <p>
              Pricing guidance is being prepared. Tell us about your goals and we’ll
              provide a tailored quote.
            </p>
            <Link className="button button-dark" href="/contact">Request a quote</Link>
          </div>
        )}

        {page?.positioningMessage && (
          <aside className="pricing-positioning">{page.positioningMessage}</aside>
        )}
      </section>

      {page && page.items.length > 0 && (
        <section className="public-cta pricing-cta">
          <h2>Every project starts with a conversation.</h2>
          <Link className="button button-dark" href="/contact">Request a quote</Link>
        </section>
      )}
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
