import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/app/components/PublicShell";
import PublicFooter from "@/app/components/PublicFooter";
import PdfViewer from "@/app/components/PdfViewer";
import { getPublication, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";
import "./publication-viewer.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [publication, settings] = await Promise.all([getPublication(slug), getSiteSettings()]);
  if (!publication) notFound();
  return pageMetadata(null, publication.title, publication.shortDescription || "A LaBio Media publication.", settings, `/publications/${encodeURIComponent(slug)}`);
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const [publication, settings] = await Promise.all([getPublication(slug), getSiteSettings()]);
  if (!publication) notFound();

  return (
    <PublicShell>
      <header className="public-page-header publication-detail-header">
        <Link href="/publications">← Print Design</Link>
        <div className="publication-intro">
          <div className="publication-meta-row">
            <h1>{publication.title}</h1>
            {publication.publicationYear !== null && <span className="publication-hero-year">{publication.publicationYear}</span>}
            <a href="#publication-reader">Read ↓</a>
            <a href={publication.pdfUrl} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
          </div>
          {publication.shortDescription && <p className="public-page-lead">{publication.shortDescription}</p>}
        </div>
      </header>
      <div className="publication-reader" id="publication-reader">
        <PdfViewer key={publication.pdfUrl} url={publication.pdfUrl} title={publication.title} cover={publication.coverImage} />
      </div>
      <section className="publication-conversion" aria-labelledby="publication-contact">
        <p className="publication-eyebrow">Print Design</p>
        <h2 id="publication-contact">Research reports, books and publications for science, research and innovation.</h2>
        <Link href="/contact">Start a project →</Link>
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
