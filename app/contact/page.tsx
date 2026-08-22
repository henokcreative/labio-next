import type { Metadata } from "next";
import BusinessIdentity from "@/app/components/BusinessIdentity";
import ContactForm from "@/app/components/ContactForm";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import { getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact — LaBio Media",
  description:
    "Start a conversation with LaBio Media about research communication, websites, video, photography or design.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PublicShell>
      <header className="public-page-header contact-route-header">
        <div className="eyebrow">Contact <span /></div>
        <h1>Let’s make the complex clear.</h1>
        <p className="public-page-lead">
          Tell us what you are working on, who it needs to reach, and where the
          communication could be stronger.
        </p>
      </header>

      <section className="contact-page-section contact-route-section">
        <div className="contact-heading">
          <div className="section-label">Start a project <span /></div>
          <h2>A thoughtful first conversation.</h2>
          <p>
            Share a little about your research, organisation or idea. We’ll
            respond with the right questions and a practical next step.
          </p>
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
