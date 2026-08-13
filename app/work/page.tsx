import type { Metadata } from "next";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import WorkGrid from "@/app/components/WorkGrid";
import { fallbackCaseStudies, fallbackPortfolioIndex } from "@/data/public-fallbacks";
import { getCaseStudyPages, getPortfolioIndexPage, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getPortfolioIndexPage(),
    getSiteSettings(),
  ]);
  return pageMetadata(
    page,
    "Selected work — LaBio Media",
    "Explore LaBio Media work across web, video, photography and design.",
    settings,
  );
}

export default async function WorkPage() {
  const [cmsPage, cmsProjects, settings] = await Promise.all([
    getPortfolioIndexPage(),
    getCaseStudyPages(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? fallbackPortfolioIndex;
  const projects = cmsProjects.length > 0 ? cmsProjects : fallbackCaseStudies;

  return (
    <PublicShell>
      <header className="public-page-header">
        <div className="eyebrow">Selected work <span /></div>
        <h1>{page.title}</h1>
        <StreamFieldRenderer blocks={page.intro} className="public-page-intro" />
      </header>
      <section className="public-list-section">
        <WorkGrid projects={projects} />
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
