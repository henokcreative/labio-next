import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import { getSiteSettings, getStandardPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

type StandardRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: StandardRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getStandardPage(slug),
    getSiteSettings(),
  ]);
  return pageMetadata(
    page,
    "LaBio Media",
    "Information from LaBio Media.",
    settings,
  );
}

export default async function StandardPage({ params }: StandardRouteProps) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getStandardPage(slug),
    getSiteSettings(),
  ]);
  if (!page) notFound();

  return (
    <PublicShell>
      <header className="public-page-header standard-page-header">
        <div className="eyebrow">LaBio Media <span /></div>
        <h1>{page.title}</h1>
      </header>
      <section className="public-content-section standard-content">
        <StreamFieldRenderer blocks={page.body} />
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
