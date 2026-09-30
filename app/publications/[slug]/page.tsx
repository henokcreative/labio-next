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
        <Link href="/publications">← Publications</Link>
        <h1>{publication.title}</h1>
        {publication.publicationYear !== null && <p>{publication.publicationYear}</p>}
        {publication.shortDescription && <p className="public-page-lead">{publication.shortDescription}</p>}
        <a href={publication.pdfUrl} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
      </header>
      <div className="publication-reader">
        <PdfViewer key={publication.pdfUrl} url={publication.pdfUrl} title={publication.title} />
      </div>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
