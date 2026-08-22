import type { Metadata } from "next";
import Link from "next/link";
import BrandName from "./components/BrandName";
import CmsImage from "./components/CmsImage";
import CollaboratorsSlider from "./components/CollaboratorsSlider";
import ContactForm from "./components/ContactForm";
import LatestUpdates from "./components/LatestUpdates";
import PublicFooter from "./components/PublicFooter";
import PublicShell from "./components/PublicShell";
import ServicesGrid from "./components/ServicesGrid";
import Testimonials from "./components/Testimonials";
import WorkGrid from "./components/WorkGrid";
import {
  fallbackCaseStudies,
  fallbackCollaborators,
  fallbackHome,
  fallbackServices,
} from "@/data/public-fallbacks";
import {
  getCaseStudyPages,
  getCollaborators,
  getHomePage,
  getServicePages,
  getSiteSettings,
  getTestimonials,
} from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";
import { organizationSchema } from "@/lib/public-schema";
import {
  resolveHomeCollaborators,
  resolveHomeTestimonials,
  resolveSelectedHomeItems,
} from "@/lib/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
  return pageMetadata(
    home,
    "LaBio Media — Research communication",
    "LaBio Media makes complex science clear through websites, video, photography and design.",
    settings,
    "/",
  );
}

export default async function Home() {
  const [cmsHome, cmsServices, cmsProjects, collaborators, testimonials, settings] =
    await Promise.all([
      getHomePage(),
      getServicePages(),
      getCaseStudyPages(),
      getCollaborators(),
      getTestimonials(),
      getSiteSettings(),
    ]);

  const home = cmsHome ?? fallbackHome;
  const services = cmsServices.length > 0 ? cmsServices : fallbackServices;
  const projects = cmsProjects.length > 0 ? cmsProjects : fallbackCaseStudies;
  const featuredServices = resolveSelectedHomeItems(
    home.featuredServices,
    services,
  );
  const selectedWork = resolveSelectedHomeItems(home.selectedWork, projects);
  const displayedCollaborators = resolveHomeCollaborators(
    cmsHome,
    collaborators,
    fallbackCollaborators,
  );
  const collaboratorsEnabled = cmsHome?.collaboratorsConfigured
    ? cmsHome.collaboratorsEnabled
    : true;
  const displayedTestimonials = resolveHomeTestimonials(cmsHome, testimonials);
  const testimonialsEnabled = cmsHome?.testimonialsConfigured
    ? cmsHome.testimonialsEnabled
    : true;
  const jsonLd = organizationSchema(settings);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero section" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            {home.heroEyebrow} <span />
          </div>
          <h1>{home.heroHeading}</h1>
          <p className="hero-text">{home.heroCopy}</p>
          <div className="hero-actions">
            {home.primaryCta.label && home.primaryCta.url && (
              <a href={home.primaryCta.url} className="button button-dark">
                {home.primaryCta.label}
              </a>
            )}
            {home.secondaryCta.label && home.secondaryCta.url && (
              <a href={home.secondaryCta.url} className="text-link">
                {home.secondaryCta.label} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
        {home.heroImage && (
          <div className="hero-image">
            <CmsImage
              image={home.heroImage}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="hero-image-label"><BrandName variant="light" /></div>
          </div>
        )}
      </section>

      {home.selectedWorkEnabled && (
        <section className="section work-section" id="work">
          <div className="section-heading">
            <div>
              {home.selectedWorkEyebrow && (
                <div className="eyebrow">
                  {home.selectedWorkEyebrow} <span />
                </div>
              )}
              <h2>{home.selectedWorkHeading}</h2>
            </div>
            {home.selectedWorkCta.label && home.selectedWorkCta.url && (
              <Link
                href={home.selectedWorkCta.url}
                className="text-link desktop-link"
              >
                {home.selectedWorkCta.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <WorkGrid projects={selectedWork.slice(0, 3)} variant="featured" />
        </section>
      )}

      {home.servicesEnabled && (
        <section className="services-section" id="services">
          {home.servicesEyebrow && (
            <div className="section-label">
              {home.servicesEyebrow} <span />
            </div>
          )}
          <div className="services-heading-row">
            <h2>{home.servicesHeading}</h2>
            {home.servicesCta.label && home.servicesCta.url && (
              <Link href={home.servicesCta.url} className="section-link">
                {home.servicesCta.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <ServicesGrid services={featuredServices.slice(0, 4)} />
        </section>
      )}

      <LatestUpdates home={home} />

      {collaboratorsEnabled && (
        <CollaboratorsSlider
          collaborators={displayedCollaborators}
          heading={home.collaboratorsHeading}
        />
      )}

      {testimonialsEnabled && (
        <Testimonials
          testimonials={displayedTestimonials}
          heading={home.testimonialsHeading}
        />
      )}

      {home.aboutEnabled && (
        <section id="about" className="about-section">
          {home.aboutEyebrow && (
            <div className="section-label">
              {home.aboutEyebrow} <span />
            </div>
          )}
          <div className="about-grid">
            <div className="about-copy">
              <h2>{home.aboutHeading}</h2>
              <p className="about-lead">{home.aboutCopy}</p>
              {home.aboutCta.label && home.aboutCta.url && (
                <Link href={home.aboutCta.url} className="about-button">
                  {home.aboutCta.label} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            {home.aboutImage && (
              <div className="about-image">
                <CmsImage image={home.aboutImage} sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            )}
          </div>
        </section>
      )}

      {home.contactEnabled && (
        <section className="contact-page-section" id="contact">
          <div className="contact-heading">
            {home.contactEyebrow && (
              <div className="section-label">
                {home.contactEyebrow} <span />
              </div>
            )}
            <h2>{home.contactHeading}</h2>
            <p>{home.contactCopy}</p>
            {settings?.publicContactEmail && (
              <p className="public-contact-detail">
                <a href={"mailto:" + settings.publicContactEmail}>
                  {settings.publicContactEmail}
                </a>
              </p>
            )}
          </div>
          <div className="contact-form-wrap">
            <ContactForm contactEmail={settings?.publicContactEmail} />
          </div>
        </section>
      )}

      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
