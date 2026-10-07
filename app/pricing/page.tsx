import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import { getPricingPage, getSiteSettings } from "@/lib/cms";
import type { CmsPricingItem } from "@/lib/cms-types";
import { offerPricePresentation } from "@/lib/pricing";
import { groupPricingItems } from "@/lib/pricing-groups";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPricingPage(), getSiteSettings()]);
  return pageMetadata(page, "Services & Investment — LaBio Media",
    "Scientific communication services for research organisations, funded projects and life-science companies.",
    settings, "/pricing");
}

function PricingOffer({ item, index, variant }: {
  item: CmsPricingItem;
  index: number;
  variant: "primary" | "featured" | "compact";
}) {
  const price = offerPricePresentation(item);
  return (
    <article className={`pricing-item pricing-item-${variant}`}>
      <header className="pricing-item-heading">
        <div className="pricing-index">{String(index + 1).padStart(2, "0")}</div>
        <div className="pricing-item-title">
          <h3>{item.title}</h3>
          {item.description && <p className="pricing-description">{item.description}</p>}
        </div>
        {price.amount && <div className="pricing-label">
          {price.label && <span className="pricing-mode-label">{price.label}</span>}
          <span>{price.amount}</span>
        </div>}
      </header>
      {(item.idealFor || item.features.length > 0 || item.context) && (
        <div className="pricing-item-details">
          {item.idealFor && <div><h4>Ideal for</h4><p>{item.idealFor}</p></div>}
          {item.features.length > 0 && <div><h4>Typical scope</h4><ul>
            {item.features.map((feature, featureIndex) => <li key={featureIndex}>{feature}</li>)}
          </ul></div>}
          {item.context && <p className="pricing-context">{item.context}</p>}
        </div>
      )}
      {(item.relatedCaseStudies.length > 0 || item.relatedServices.length > 0) && (
        <nav className="pricing-related" aria-label={`Related to ${item.title}`}>
          {item.relatedCaseStudies.length > 0 && <div className="pricing-related-work">
            <span className="pricing-related-label">Related work</span>
            {item.relatedCaseStudies.map(work => <Link key={work.id} href={`/work/${work.slug}`}>{work.title}</Link>)}
          </div>}
          {item.relatedServices.length > 0 && <div className="pricing-related-services">
            <span className="pricing-related-label">Related services</span>
            {item.relatedServices.map(service => <Link key={service.id} href={`/services/${service.slug}`}>{service.title}</Link>)}
          </div>}
        </nav>
      )}
      {item.cta.label && item.cta.url && <a className="text-link pricing-item-cta" href={item.cta.url}>
        {item.cta.label} <span aria-hidden="true">→</span>
      </a>}
    </article>
  );
}

export default async function PricingPage() {
  const [page, settings] = await Promise.all([getPricingPage(), getSiteSettings()]);
  const groups = groupPricingItems(page?.items ?? []);
  const sections = [
    { id: "core", label: "Core Expertise", heading: "Specialist communication for science and research", items: groups.core, variant: "primary" },
    { id: "integrated", label: "Integrated Communication", heading: "", items: groups.integrated, variant: "featured" },
    { id: "additional", label: "Additional & Ongoing Services", heading: "Support where the project needs it", items: groups.additional, variant: "compact" },
  ] as const;
  return (
    <PublicShell>
      <header className="public-page-header pricing-header">
        <h1>{page?.title || "Services & Investment"}</h1>
        {page?.intro && <p className="public-page-lead">{page.intro}</p>}
      </header>
      <div className="pricing-section">
        {sections.map(section => section.items.length > 0 && (
          <section className="pricing-group" key={section.id} aria-labelledby={`pricing-${section.id}`}>
            <header className="pricing-group-heading">
              {section.heading ? <>
                <p className="pricing-kicker">{section.label}</p>
                <h2 id={`pricing-${section.id}`}>{section.heading}</h2>
              </> : <h2 id={`pricing-${section.id}`}>{section.label}</h2>}
            </header>
            <div className="pricing-list">
              {section.items.map(({ item, index }) => <PricingOffer key={item.id} item={item} index={index} variant={section.variant} />)}
            </div>
          </section>
        ))}
        {page?.positioningMessage && <section className="pricing-positioning" aria-labelledby="pricing-positioning-heading">
          <h2 id="pricing-positioning-heading">Start with the communication problem</h2>
          <p>{page.positioningMessage}</p>
          <Link href="/contact" className="text-link">Tell us about your project <span aria-hidden="true">→</span></Link>
        </section>}
      </div>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
