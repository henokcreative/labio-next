import Link from "next/link";
import type { CmsServicePage } from "@/lib/cms-types";

export default function ServicesGrid({
  services,
  headingLevel = "h3",
}: {
  services: CmsServicePage[];
  headingLevel?: "h2" | "h3";
}) {
  if (services.length === 0) {
    return <p className="cms-empty">Service information is being prepared.</p>;
  }

  const Heading = headingLevel;

  return (
    <div className="services-grid">
      {services.map((service, index) => (
        <article className="service-item" key={service.id}>
          <div className="service-number">{String(index + 1).padStart(2, "0")}</div>
          <Heading>{service.title}</Heading>
          <p>{service.summary}</p>
          <Link href={"/services/" + service.meta.slug} className="service-link">
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
