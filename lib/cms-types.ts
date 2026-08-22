export type CmsImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type CmsPageMeta = {
  type: string;
  slug: string;
  seoTitle: string;
  searchDescription: string;
  firstPublishedAt?: string;
};

export type CmsPageSummary = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
};

export type CmsPageBase = {
  id: number;
  title: string;
  meta: CmsPageMeta;
  socialImage: CmsImage | null;
};

export type CmsHeadingBlock = {
  id?: string;
  type: "heading";
  value: {
    text: string;
    level: "h2" | "h3";
  };
};

export type CmsRichTextBlock = {
  id?: string;
  type: "rich_text";
  value: string;
};

export type CmsImageBlock = {
  id?: string;
  type: "image";
  value: CmsImage;
};

export type CmsQuoteBlock = {
  id?: string;
  type: "quote";
  value: {
    quote: string;
    attribution: string;
  };
};

export type CmsEmbedBlock = {
  id?: string;
  type: "embed";
  value: string;
};

export type CmsCtaBlock = {
  id?: string;
  type: "cta";
  value: {
    label: string;
    url: string;
  };
};

export type CmsStreamBlock =
  | CmsHeadingBlock
  | CmsRichTextBlock
  | CmsImageBlock
  | CmsQuoteBlock
  | CmsEmbedBlock
  | CmsCtaBlock;

export type CmsCapability = {
  id?: string;
  title: string;
  description: string;
};

export type CmsProcessStep = CmsCapability;
export type CmsValue = CmsCapability;

export type CmsHomePage = CmsPageBase & {
  kind: "home";
  heroEyebrow: string;
  heroHeading: string;
  heroCopy: string;
  heroImage: CmsImage | null;
  primaryCta: CmsLink;
  secondaryCta: CmsLink;
  selectedWorkEnabled: boolean;
  selectedWorkEyebrow: string;
  selectedWorkHeading: string;
  selectedWorkCta: CmsLink;
  selectedWork: CmsPageSummary[];
  servicesEnabled: boolean;
  servicesEyebrow: string;
  servicesHeading: string;
  servicesCta: CmsLink;
  featuredServices: CmsPageSummary[];
  collaboratorsConfigured: boolean;
  collaboratorsEnabled: boolean;
  collaboratorsHeading: string;
  collaborators: CmsCollaborator[];
  testimonialsConfigured: boolean;
  testimonialsEnabled: boolean;
  testimonialsHeading: string;
  testimonials: CmsTestimonial[];
  aboutEnabled: boolean;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutCopy: string;
  aboutImage: CmsImage | null;
  aboutCta: CmsLink;
  contactEnabled: boolean;
  contactEyebrow: string;
  contactHeading: string;
  contactCopy: string;
  contactCta: CmsLink;
};

export type CmsServiceIndexPage = CmsPageBase & {
  kind: "service-index";
  intro: CmsStreamBlock[];
};

export type CmsServicePage = CmsPageBase & {
  kind: "service";
  summary: string;
  heroImage: CmsImage | null;
  body: CmsStreamBlock[];
  capabilities: CmsCapability[];
  process: CmsProcessStep[];
  cta: CmsLink;
  relatedCaseStudies: CmsPageSummary[];
};

export type CmsPortfolioIndexPage = CmsPageBase & {
  kind: "portfolio-index";
  intro: CmsStreamBlock[];
};

export type CmsCaseStudyPage = CmsPageBase & {
  kind: "case-study";
  clientDisplayName: string;
  category: string;
  summary: string;
  body: CmsStreamBlock[];
  heroImage: CmsImage | null;
  gallery: CmsImage[];
  embedUrl: string;
  services: CmsPageSummary[];
  publicationDate?: string;
  featured: boolean;
};

export type CmsAboutPage = CmsPageBase & {
  kind: "about";
  heroImage: CmsImage | null;
  intro: string;
  body: CmsStreamBlock[];
  values: CmsValue[];
  process: CmsProcessStep[];
};

export type CmsStandardPage = CmsPageBase & {
  kind: "standard";
  body: CmsStreamBlock[];
};

export type CmsPricingItem = {
  id: number;
  title: string;
  priceLabel: string;
  description: string;
  features: string[];
  cta: CmsLink;
};

export type CmsPricingPage = CmsPageBase & {
  kind: "pricing";
  intro: string;
  items: CmsPricingItem[];
  positioningMessage: string;
};

export type CmsCollaborator = {
  id: number;
  organizationName: string;
  logo: CmsImage;
  url: string;
  displayOrder: number;
  visualVariant: string;
};

export type CmsTestimonial = {
  id: number;
  quote: string;
  person: string;
  role: string;
  organization: string;
  relatedService: CmsPageSummary | null;
  relatedCaseStudy: CmsPageSummary | null;
};

export type CmsLink = {
  label: string;
  url: string;
};

export type CmsSocialLink = CmsLink;

export type CmsSiteSettings = {
  publicContactEmail: string;
  publicPhone: string;
  address: string;
  defaultCta: CmsLink;
  socialLinks: CmsSocialLink[];
  defaultSocialImage: CmsImage | null;
};

export type CmsPublicPage =
  | CmsHomePage
  | CmsServiceIndexPage
  | CmsServicePage
  | CmsPortfolioIndexPage
  | CmsCaseStudyPage
  | CmsAboutPage
  | CmsStandardPage
  | CmsPricingPage;
