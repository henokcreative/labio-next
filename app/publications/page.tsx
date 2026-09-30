import type { Metadata } from "next";
import PublicShell from "@/app/components/PublicShell";
import PublicFooter from "@/app/components/PublicFooter";
import PublicationGrid from "@/app/components/PublicationGrid";
import { getPublications, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";
import "./publications.css";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    null,
    "Publications — LaBio Media",
    "Publications from LaBio Media: science, research and creative communication.",
    await getSiteSettings(),
    "/publications",
  );
}

export default async function PublicationsPage() {
  const [publications, settings] = await Promise.all([
    getPublications(),
    getSiteSettings(),
  ]);

  return (
    <PublicShell>
      <header className="public-page-header">
        <h1>Publications</h1>
      </header>
      <section className="publications-list" aria-label="Publications">
        <PublicationGrid publications={publications} />
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
