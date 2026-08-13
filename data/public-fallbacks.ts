import { projects } from "./projects";
import type {
  CmsAboutPage,
  CmsCaseStudyPage,
  CmsHomePage,
  CmsPageMeta,
  CmsPortfolioIndexPage,
  CmsServiceIndexPage,
  CmsServicePage,
} from "@/lib/cms-types";

const fallbackMeta = (type: string, slug: string): CmsPageMeta => ({
  type,
  slug,
  seoTitle: "",
  searchDescription: "",
});

const localImage = (url: string, alt: string) => ({
  url,
  width: 1600,
  height: 1000,
  alt,
});

export const fallbackServices: CmsServicePage[] = [
  {
    id: -101,
    kind: "service",
    title: "Web & Digital",
    meta: fallbackMeta("fallback.ServicePage", "web-digital"),
    socialImage: null,
    summary:
      "Bespoke websites and digital experiences for research groups, organisations and scientific projects.",
    heroImage: localImage(
      "/images/work/webdesignDev/thumb-bioscience.png",
      "A LaBio Media website project",
    ),
    body: [],
    capabilities: [
      { title: "Web design", description: "Clear, editorial digital systems." },
      { title: "Development", description: "Responsive, maintainable websites." },
      { title: "Digital strategy", description: "Structure built around audiences and goals." },
    ],
    process: [],
    cta: { label: "Discuss a web project", url: "/#contact" },
    relatedCaseStudies: [],
  },
  {
    id: -102,
    kind: "service",
    title: "Video Production",
    meta: fallbackMeta("fallback.ServicePage", "video-production"),
    socialImage: null,
    summary:
      "Research films, interviews and visual storytelling that make complex ideas easier to understand.",
    heroImage: localImage(
      "/images/work/videos/thumb-inflames.JPG",
      "Research video production",
    ),
    body: [],
    capabilities: [
      { title: "Research films", description: "Stories grounded in scientific context." },
      { title: "Interviews", description: "Human, confident on-camera communication." },
      { title: "Editing", description: "A clear narrative from complex material." },
    ],
    process: [],
    cta: { label: "Discuss a video project", url: "/#contact" },
    relatedCaseStudies: [],
  },
  {
    id: -103,
    kind: "service",
    title: "Photography",
    meta: fallbackMeta("fallback.ServicePage", "photography"),
    socialImage: null,
    summary:
      "People, laboratories, events and environments captured with purpose and attention to detail.",
    heroImage: localImage(
      "/images/work/photos/pia_lab.jpg",
      "Photography in a research laboratory",
    ),
    body: [],
    capabilities: [
      { title: "People", description: "Natural portraits in real working environments." },
      { title: "Laboratories", description: "Credible images of research in practice." },
      { title: "Events", description: "Purposeful coverage and visual documentation." },
    ],
    process: [],
    cta: { label: "Discuss photography", url: "/#contact" },
    relatedCaseStudies: [],
  },
  {
    id: -104,
    kind: "service",
    title: "Brand & Design",
    meta: fallbackMeta("fallback.ServicePage", "brand-design"),
    socialImage: null,
    summary:
      "Visual identities, publications, infographics and digital materials that make complex information clear.",
    heroImage: localImage(
      "/images/work/webprintdesign/Euro BioImaging Poster EMBL_2.png",
      "Scientific communication design",
    ),
    body: [],
    capabilities: [
      { title: "Visual identity", description: "Distinct systems with scientific credibility." },
      { title: "Publications", description: "Clear editorial design for detailed information." },
      { title: "Infographics", description: "Complex ideas made easier to understand." },
    ],
    process: [],
    cta: { label: "Discuss a design project", url: "/#contact" },
    relatedCaseStudies: [],
  },
];

export const fallbackCaseStudies: CmsCaseStudyPage[] = Object.entries(projects).map(
  ([slug, project], index) => ({
    id: -201 - index,
    kind: "case-study",
    title: project.title,
    meta: fallbackMeta("fallback.CaseStudyPage", slug),
    socialImage: null,
    clientDisplayName: project.title,
    category: project.category,
    summary: project.description,
    body: [
      {
        type: "heading",
        value: { text: "The challenge", level: "h2" },
      },
      { type: "rich_text", value: `<p>${project.challenge}</p>` },
      {
        type: "heading",
        value: { text: "The approach", level: "h2" },
      },
      { type: "rich_text", value: `<p>${project.approach}</p>` },
    ],
    heroImage: localImage(project.hero, project.title),
    gallery: project.images.map((image) => localImage(image.src, image.alt)),
    embedUrl: "",
    services: project.services.map((title, serviceIndex) => ({
      id: -1000 - index * 10 - serviceIndex,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    })),
    featured: true,
  }),
);

export const fallbackHome: CmsHomePage = {
  id: -1,
  kind: "home",
  title: "LaBio Media",
  meta: fallbackMeta("fallback.HomePage", "home"),
  socialImage: null,
  heroEyebrow: "Research communication",
  heroHeading: "We make complex science clear and visible.",
  heroCopy:
    "LaBio Media helps research organisations communicate their ideas through websites, video, photography and design.",
  heroImage: localImage(
    "/images/hero/labio-about-hero.jpg",
    "LaBio Media creative work",
  ),
  primaryCta: { label: "View selected work", url: "/work" },
  secondaryCta: { label: "What we do", url: "/services" },
  selectedWork: fallbackCaseStudies.map(({ id, title, meta, summary, category }) => ({
    id,
    title,
    slug: meta.slug,
    summary,
    category,
  })),
  featuredServices: fallbackServices.map(({ id, title, meta, summary }) => ({
    id,
    title,
    slug: meta.slug,
    summary,
  })),
  aboutHeading: "Science understanding. Creative communication.",
  aboutCopy:
    "LaBio Media combines scientific understanding with creative communication to help research organisations explain what they do clearly and effectively.",
  aboutImage: localImage("/images/work/team/hk.jpg", "LaBio Media"),
  contactHeading: "Let’s talk about your project.",
  contactCopy:
    "Have an idea, a research project, a website that needs a new direction, or simply want to explore something?",
  contactCta: { label: "Start a conversation", url: "/#contact" },
};

export const fallbackServiceIndex: CmsServiceIndexPage = {
  id: -2,
  kind: "service-index",
  title: "Services",
  meta: fallbackMeta("fallback.ServiceIndexPage", "services"),
  socialImage: null,
  intro: [],
};

export const fallbackPortfolioIndex: CmsPortfolioIndexPage = {
  id: -3,
  kind: "portfolio-index",
  title: "Work",
  meta: fallbackMeta("fallback.PortfolioIndexPage", "work"),
  socialImage: null,
  intro: [],
};

export const fallbackAbout: CmsAboutPage = {
  id: -4,
  kind: "about",
  title: "About",
  meta: fallbackMeta("fallback.AboutPage", "about"),
  socialImage: null,
  heroImage: localImage("/images/work/team/hk.jpg", "LaBio Media"),
  intro:
    "LaBio Media combines scientific understanding with creative communication for research and innovation.",
  body: [],
  values: [],
  process: [],
};

export function findFallbackService(slug: string): CmsServicePage | null {
  return fallbackServices.find((service) => service.meta.slug === slug) ?? null;
}

export function findFallbackCaseStudy(slug: string): CmsCaseStudyPage | null {
  return fallbackCaseStudies.find((project) => project.meta.slug === slug) ?? null;
}
