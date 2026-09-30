import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/app/components/PublicShell";
import PublicFooter from "@/app/components/PublicFooter";
import CmsImage from "@/app/components/CmsImage";
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
        <Link href="/publications">← Publications</Link>
        <div className="publication-hero">
          <div>
            <p className="publication-eyebrow">Print Design</p>
            <h1>{publication.title}</h1>
            {publication.shortDescription && <p className="public-page-lead">{publication.shortDescription}</p>}
            {publication.publicationYear !== null && <p className="publication-hero-year">{publication.publicationYear}</p>}
            <a className="publication-view-link" href="#publication-reader">View publication ↓</a>
            <a className="publication-original-link" href={publication.pdfUrl} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
          </div>
          {publication.coverImage && <div className="publication-hero-cover"><CmsImage image={publication.coverImage} priority sizes="(max-width: 700px) 85vw, 35vw" /></div>}
        </div>
      </header>
      <div className="publication-reader" id="publication-reader">
        <PdfViewer key={publication.pdfUrl} url={publication.pdfUrl} title={publication.title} cover={publication.coverImage} />
      </div>
      <section className="publication-conversion" aria-labelledby="publication-contact">
        <p className="publication-eyebrow">Print Design</p>
        <h2 id="publication-contact">Need a report, research publication or editorial piece like this?</h2>
        <p>We design scientific and research publications from concept to final production.</p>
        <Link href="/contact">Start a project →</Link>
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
