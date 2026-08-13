import Link from "next/link";
import type { CmsServicePage } from "@/lib/cms-types";

export default function ServicesGrid({ services }: { services: CmsServicePage[] }) {
  if (services.length === 0) {
    return <p className="cms-empty">Service information is being prepared.</p>;
  }

  return (
    <div className="services-grid">
      {services.map((service, index) => (
        <article className="service-item" key={service.id}>
          <div className="service-number">{String(index + 1).padStart(2, "0")}</div>
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
          <Link href={"/services/" + service.meta.slug} className="service-link">
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
