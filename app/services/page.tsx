import type { Metadata } from "next";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import ServicesGrid from "@/app/components/ServicesGrid";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import { fallbackServiceIndex, fallbackServices } from "@/data/public-fallbacks";
import { getServiceIndexPage, getServicePages, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getServiceIndexPage(), getSiteSettings()]);
  return pageMetadata(
    page,
    "Services — LaBio Media",
    "Creative communication services for research organisations and scientific projects.",
    settings,
    "/services",
  );
}

export default async function ServicesPage() {
  const [cmsPage, cmsServices, settings] = await Promise.all([
    getServiceIndexPage(),
    getServicePages(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? fallbackServiceIndex;
  const services = cmsServices.length > 0 ? cmsServices : fallbackServices;

  return (
    <PublicShell>
      <header className="public-page-header">
        <div className="eyebrow">What we do <span /></div>
        <h1>{page.title}</h1>
        <StreamFieldRenderer blocks={page.intro} className="public-page-intro" />
      </header>
      <section className="services-section public-list-section">
        <ServicesGrid services={services} headingLevel="h2" />
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
