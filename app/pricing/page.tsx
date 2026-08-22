import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import { getPricingPage, getSiteSettings } from "@/lib/cms";
import { formatOfferPrice } from "@/lib/pricing";
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
        <h1>{page?.title || "Pricing"}</h1>
        {page?.intro && <p className="public-page-lead">{page.intro}</p>}
      </header>

      {page && (page.items.length > 0 || page.positioningMessage) && (
        <section className="pricing-section" aria-label="Commercial offers">
          {page.items.length > 0 && (
            <div className="pricing-list">
              {page.items.map((item, index) => {
                const displayPrice = formatOfferPrice(item);
                const hasDetails = Boolean(
                  item.idealFor || item.features.length || item.context,
                );
                const hasRelations = Boolean(
                  item.relatedServices.length || item.relatedCaseStudies.length,
                );

                return (
                  <article
                    className={`pricing-item${item.featured ? " pricing-item-featured" : ""}`}
                    key={item.id}
                  >
                    <header className="pricing-item-heading">
                      <div className="pricing-index">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="pricing-item-title">
                        <h2>{item.title}</h2>
                        {item.description && (
                          <p className="pricing-description">{item.description}</p>
                        )}
                      </div>
                      {displayPrice && <p className="pricing-label">{displayPrice}</p>}
                    </header>

                    {hasDetails && (
                      <div className="pricing-item-details">
                        {item.idealFor && (
                          <div>
                            <h3>Ideal for</h3>
                            <p>{item.idealFor}</p>
                          </div>
                        )}
                        {item.features.length > 0 && (
                          <div>
                            <h3>Included</h3>
                            <ul>
                              {item.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.context && (
                          <div>
                            <h3>Context</h3>
                            <p>{item.context}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {hasRelations && (
                      <nav className="pricing-related" aria-label={`Related to ${item.title}`}>
                        {item.relatedServices.map((service) => (
                          <Link href={`/services/${service.slug}`} key={`service-${service.id}`}>
                            {service.title}
                          </Link>
                        ))}
                        {item.relatedCaseStudies.map((caseStudy) => (
                          <Link href={`/work/${caseStudy.slug}`} key={`work-${caseStudy.id}`}>
                            {caseStudy.title}
                          </Link>
                        ))}
                      </nav>
                    )}

                    {item.cta.label && item.cta.url && (
                      <a className="text-link pricing-item-cta" href={item.cta.url}>
                        {item.cta.label} <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {page.positioningMessage && (
            <aside className="pricing-positioning">{page.positioningMessage}</aside>
          )}
        </section>
      )}
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
