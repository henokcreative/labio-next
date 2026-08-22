import type { Metadata } from "next";
import BusinessIdentity from "@/app/components/BusinessIdentity";
import ContactForm from "@/app/components/ContactForm";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import StreamFieldRenderer from "@/app/components/StreamFieldRenderer";
import { fallbackContact } from "@/data/public-fallbacks";
import { getContactPage, getSiteSettings } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [cmsPage, settings] = await Promise.all([
    getContactPage(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? fallbackContact;
  return pageMetadata(
    page,
    "Contact — LaBio Media",
    "Start a conversation with LaBio Media about research communication, websites, video, photography or design.",
    settings,
    "/contact",
  );
}

export default async function ContactPage() {
  const [cmsPage, settings] = await Promise.all([
    getContactPage(),
    getSiteSettings(),
  ]);
  const page = cmsPage ?? fallbackContact;

  return (
    <PublicShell>
      <header className="public-page-header contact-route-header">
        <div className="eyebrow">{page.eyebrow} <span /></div>
        <h1>{page.title}</h1>
        <p className="public-page-lead">{page.intro}</p>
      </header>

      <section className="contact-page-section contact-route-section">
        <div className="contact-heading">
          <div className="section-label">Start a project <span /></div>
          <StreamFieldRenderer blocks={page.body} className="contact-editorial-body" />
          <BusinessIdentity label="Official details" settings={settings} />
        </div>
        <div className="contact-form-wrap">
          <ContactForm contactEmail={settings?.publicContactEmail} />
        </div>
      </section>

      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
