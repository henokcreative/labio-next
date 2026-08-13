import type { Metadata } from "next";
import Link from "next/link";
import CmsImage from "./components/CmsImage";
import CollaboratorsSlider from "./components/CollaboratorsSlider";
import ContactForm from "./components/ContactForm";
import PublicFooter from "./components/PublicFooter";
import PublicShell from "./components/PublicShell";
import ServicesGrid from "./components/ServicesGrid";
import Testimonials from "./components/Testimonials";
import WorkGrid from "./components/WorkGrid";
import {
  fallbackCaseStudies,
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

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
  return pageMetadata(
    home,
    "LaBio Media — Research communication",
    "LaBio Media makes complex science clear through websites, video, photography and design.",
    settings,
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
  const resolvedFeaturedServices = home.featuredServices.length > 0
    ? home.featuredServices
        .map((summary) => services.find((service) => service.id === summary.id))
        .filter((service): service is (typeof services)[number] => Boolean(service))
    : services;
  const featuredServices = resolvedFeaturedServices.length > 0
    ? resolvedFeaturedServices
    : services;
  const resolvedSelectedWork = home.selectedWork.length > 0
    ? home.selectedWork
        .map((summary) => projects.find((project) => project.id === summary.id))
        .filter((project): project is (typeof projects)[number] => Boolean(project))
    : projects;
  const selectedWork = resolvedSelectedWork.length > 0
    ? resolvedSelectedWork
    : projects;

  return (
    <PublicShell>
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
            <div className="hero-image-label">LABIO MEDIA</div>
          </div>
        )}
      </section>

      <CollaboratorsSlider collaborators={collaborators} />

      <section className="section work-section" id="work">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              Selected work <span />
            </div>
            <h2>Turning research into meaningful stories</h2>
          </div>
          <Link href="/work" className="text-link desktop-link">
            View all work <span aria-hidden="true">→</span>
          </Link>
        </div>
        <WorkGrid projects={selectedWork.slice(0, 3)} />
      </section>

      <section className="services-section" id="services">
        <div className="section-label">
          What we do <span />
        </div>
        <div className="services-heading-row">
          <h2>Communication solutions for research and innovation.</h2>
          <Link href="/services" className="section-link">
            See all services <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ServicesGrid services={featuredServices.slice(0, 4)} />
      </section>

      <section id="about" className="about-section">
        <div className="section-label">
          About LaBio Media <span />
        </div>
        <div className="about-grid">
          <div className="about-copy">
            <h2>{home.aboutHeading}</h2>
            <p className="about-lead">{home.aboutCopy}</p>
            <Link href="/about" className="about-button">
              More about LaBio Media <span aria-hidden="true">→</span>
            </Link>
          </div>
          {home.aboutImage && (
            <div className="about-image">
              <CmsImage image={home.aboutImage} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          )}
        </div>
      </section>

      <Testimonials testimonials={testimonials} />

      <section className="contact-page-section" id="contact">
        <div className="contact-heading">
          <div className="section-label">
            Contact <span />
          </div>
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
          <ContactForm />
        </div>
      </section>

      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
