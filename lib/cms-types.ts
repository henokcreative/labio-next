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
  updatesEnabled: boolean;
  updatesEyebrow: string;
  updatesHeading: string;
  updatesItemCount: number;
  updatesCta: CmsLink;
  latestUpdates: CmsUpdateSummary[];
};

export type CmsServiceIndexPage = CmsPageBase & {
  kind: "service-index";
  intro: CmsStreamBlock[];
};

export type CmsCaseStudySummary = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  heroImage: CmsImage | null;
};

export type CmsServicePage = CmsPageBase & {
  kind: "service";
  summary: string;
  body: CmsStreamBlock[];
  capabilities: CmsCapability[];
  process: CmsProcessStep[];
  testimonialsEnabled: boolean;
  testimonialsHeading: string;
  testimonials: CmsTestimonial[];
  relatedWorkEnabled: boolean;
  relatedWorkHeading: string;
  ctaHeading: string;
  cta: CmsLink;
  relatedCaseStudies: CmsCaseStudySummary[];
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
  projectYear: string;
  challenge: string;
  approach: string;
  deliverables: string[];
  outcome: string;
  projectUrl: string;
  cta: CmsLink;
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
  pageEyebrow: string;
  valuesLabel: string;
  processLabel: string;
  testimonialsEnabled: boolean;
  testimonialsHeading: string;
  testimonials: CmsTestimonial[];
};

export type CmsStandardPage = CmsPageBase & {
  kind: "standard";
  body: CmsStreamBlock[];
};

export type CmsContactPage = CmsPageBase & {
  kind: "contact";
  eyebrow: string;
  intro: string;
  body: CmsStreamBlock[];
};

export type CmsPricingMode = "starting_from" | "fixed" | "custom";

export type CmsPricingItem = {
  id: number;
  title: string;
  pricingMode: CmsPricingMode;
  currency: string;
  priceLabel: string;
  description: string;
  idealFor: string;
  features: string[];
  context: string;
  cta: CmsLink;
  featured: boolean;
  relatedServices: CmsPageSummary[];
  relatedCaseStudies: CmsPageSummary[];
};

export type CmsPricingPage = CmsPageBase & {
  kind: "pricing";
  intro: string;
  items: CmsPricingItem[];
  positioningMessage: string;
};

export type CmsArticleType = "insight" | "milestone" | "update";

type CmsUpdateSummaryBase = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featured: boolean;
  featuredImage: CmsImage | null;
};

export type CmsArticleSummary = CmsUpdateSummaryBase & {
  kind: "article";
  articleType: CmsArticleType;
  articleTypeLabel: string;
  publicationDate: string;
};

export type CmsEventSummary = CmsUpdateSummaryBase & {
  kind: "event";
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location: string;
  registrationUrl: string;
};

export type CmsUpdateSummary = CmsArticleSummary | CmsEventSummary;

export type CmsUpdatesIndexPage = CmsPageBase & {
  kind: "updates-index";
  articles: CmsArticleSummary[];
  upcomingEvents: CmsEventSummary[];
  pastEvents: CmsEventSummary[];
};

export type CmsArticlePage = CmsPageBase & {
  kind: "article";
  articleType: CmsArticleType;
  articleTypeLabel: string;
  summary: string;
  featuredImage: CmsImage | null;
  publicationDate: string;
  featured: boolean;
  body: CmsStreamBlock[];
};

export type CmsEventPage = CmsPageBase & {
  kind: "event";
  summary: string;
  featuredImage: CmsImage | null;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location: string;
  registrationUrl: string;
  featured: boolean;
  body: CmsStreamBlock[];
};

export type CmsUpdatePage = CmsArticlePage | CmsEventPage;

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

export type CmsNavigationLink = {
  label: string;
  href: string;
  external: boolean;
};

export type CmsSiteSettings = {
  legalBusinessName: string;
  businessId: string;
  city: string;
  country: string;
  publicContactEmail: string;
  publicPhone: string;
  address: string;
  defaultCta: CmsLink;
  socialLinks: CmsSocialLink[];
  navigationLinks: CmsNavigationLink[];
  defaultSocialImage: CmsImage | null;
};

export type CmsPublicPage =
  | CmsHomePage
  | CmsServiceIndexPage
  | CmsServicePage
  | CmsPortfolioIndexPage
  | CmsCaseStudyPage
  | CmsAboutPage
  | CmsContactPage
  | CmsStandardPage
  | CmsPricingPage
  | CmsUpdatesIndexPage
  | CmsUpdatePage;
