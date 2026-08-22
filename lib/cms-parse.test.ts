import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCaseStudyPage,
  parseCollaborators,
  parseHomePage,
  parsePricingPage,
  parseServicePage,
  parseStreamField,
  parseTestimonials,
  resolveCmsMediaUrl,
} from "./cms-parse";
import type {
  CmsAboutPage,
  CmsCollaborator,
  CmsStandardPage,
} from "./cms-types";
import {
  resolveAboutPage,
  resolveCollaborators,
  resolveHomeCollaborators,
  resolveHomeTestimonials,
  resolveSelectedHomeItems,
  resolveStandardPage,
} from "./public-content";


const apiUrl = "https://api.example.com";
const meta = {
  type: "public_content.HomePage",
  slug: "home",
  seo_title: "Public title",
  search_description: "Public description",
};

test("parses valid CMS pages and resolves relative rendition URLs", () => {
  const page = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_eyebrow: "Research",
      hero_heading: "Clear science",
      hero_copy: "A clear introduction.",
      hero_image: { url: "/media/hero.jpg", width: 1600, height: 900, alt: "Hero" },
      selected_work_enabled: true,
      selected_work_eyebrow: "Selected work",
      selected_work_heading: "Research stories",
      selected_work_cta_label: "View work",
      selected_work_cta_url: "/work",
      selected_work: [{ id: 2, title: "Study", slug: "study" }],
      services_enabled: true,
      services_eyebrow: "What we do",
      services_heading: "Research communication",
      services_cta_label: "View services",
      services_cta_url: "/services",
      featured_services: [],
      collaborators_enabled: true,
      collaborators_heading: "Research partners",
      collaborators: [
        {
          id: 3,
          organization_name: "CMS partner",
          logo: { url: "/media/logo.svg", width: 200, height: 80, alt: "Logo" },
          url: "https://partner.example.com",
          display_order: 1,
          visual_variant: "default",
        },
      ],
      testimonials_enabled: true,
      testimonials_heading: "Client perspectives",
      testimonials: [
        {
          id: 4,
          quote: "A clear collaboration.",
          person: "Client",
          role: "Researcher",
          organization: "Institute",
          related_service: null,
          related_case_study: null,
        },
      ],
      about_enabled: true,
      about_eyebrow: "About LaBio Media",
      about_cta_label: "More about LaBio Media",
      about_cta_url: "/about",
      contact_enabled: true,
      contact_eyebrow: "Contact",
    },
    apiUrl,
  );

  assert.equal(page?.heroImage?.url, "https://api.example.com/media/hero.jpg");
  assert.equal(page?.selectedWorkEnabled, true);
  assert.equal(page?.selectedWorkHeading, "Research stories");
  assert.equal(page?.selectedWorkCta.url, "/work");
  assert.equal(page?.selectedWork[0].slug, "study");
  assert.equal(page?.servicesEnabled, true);
  assert.equal(page?.servicesHeading, "Research communication");
  assert.equal(page?.servicesCta.url, "/services");
  assert.equal(page?.collaboratorsConfigured, true);
  assert.equal(page?.collaboratorsEnabled, true);
  assert.equal(page?.collaboratorsHeading, "Research partners");
  assert.equal(page?.collaborators[0].organizationName, "CMS partner");
  assert.equal(page?.testimonialsConfigured, true);
  assert.equal(page?.testimonials[0].person, "Client");
  assert.equal(page?.aboutEnabled, true);
  assert.equal(page?.aboutCta.url, "/about");
  assert.equal(page?.contactEnabled, true);
  assert.equal(page?.contactEyebrow, "Contact");
  assert.equal(page?.meta.seoTitle, "Public title");
});

test("rejects malformed required page and image fields", () => {
  assert.equal(parseHomePage({ title: "No id" }, apiUrl), null);
  assert.equal(resolveCmsMediaUrl("javascript:alert(1)", apiUrl), null);
  const page = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
      hero_image: { url: "/media/x", width: 0, height: 5 },
    },
    apiUrl,
  );
  assert.equal(page?.heroImage, null);
  assert.equal(parseHomePage({ id: 1, title: "Home", meta }, apiUrl), null);
});

test("maps only supported StreamField blocks and ignores unknown blocks", () => {
  const blocks = parseStreamField(
    [
      { id: "a", type: "heading", value: { text: "A heading", level: "h3" } },
      { id: "b", type: "cta", value: { label: "Contact", url: "javascript:bad" } },
      { id: "c", type: "unknown", value: "ignored" },
    ],
    apiUrl,
  );

  assert.deepEqual(blocks, [
    { id: "a", type: "heading", value: { text: "A heading", level: "h3" } },
  ]);
});

test("pricing parser preserves API order and tolerates empty items", () => {
  const page = parsePricingPage(
    {
      id: 8,
      title: "Pricing",
      meta: { ...meta, type: "public_content.PricingPage", slug: "pricing" },
      intro: "Starting points",
      pricing_items: [
        {
          id: 3,
          title: "Photography",
          price_label: "From 400",
          description: "A shoot",
          features: ["Planning", 7, "Delivery"],
          cta_label: "Quote",
          cta_url: "/#contact",
        },
      ],
      positioning_message: "Scoped individually.",
    },
    apiUrl,
  );

  assert.deepEqual(page?.items[0].features, ["Planning", "Delivery"]);
  assert.equal(page?.items[0].cta.url, "/#contact");
  assert.deepEqual(parsePricingPage({ id: 8, title: "Pricing", meta }, apiUrl)?.items, []);
});

test("service and work payloads retain only controlled route data", () => {
  const service = parseServicePage(
    {
      id: 2,
      title: "Photography",
      meta: { ...meta, type: "public_content.ServicePage", slug: "photography" },
      summary: "Research photography",
      capabilities: [
        { type: "capability", value: { title: "Portraits", description: "On location" } },
        { type: "unknown", value: { title: "Ignored" } },
      ],
      related_case_studies: [{ id: 3, title: "A study", slug: "a-study" }],
    },
    apiUrl,
  );
  const project = parseCaseStudyPage(
    {
      id: 3,
      title: "A study",
      meta: { ...meta, type: "public_content.CaseStudyPage", slug: "a-study" },
      summary: "A public case study",
      gallery: [
        {
          type: "image",
          value: { url: "/media/work.jpg", width: 900, height: 600, alt: "Work" },
        },
      ],
      services: [{ id: 2, title: "Photography", slug: "photography" }],
    },
    apiUrl,
  );

  assert.equal(service?.capabilities.length, 1);
  assert.equal(service?.relatedCaseStudies[0].slug, "a-study");
  assert.equal(project?.gallery[0].url, "https://api.example.com/media/work.jpg");
  assert.equal(project?.services[0].slug, "photography");
});

test("invalid collaborators and testimonials are omitted defensively", () => {
  assert.deepEqual(parseCollaborators([{ id: 1, organization_name: "No logo" }], apiUrl), []);
  assert.deepEqual(parseTestimonials([{ id: 1, quote: "Missing person" }]), []);
});

const fallbackAboutPage: CmsAboutPage = {
  id: -1,
  kind: "about",
  title: "Fallback about",
  meta: {
    type: "fallback.AboutPage",
    slug: "about",
    seoTitle: "",
    searchDescription: "",
  },
  socialImage: null,
  heroImage: null,
  intro: "Fallback introduction",
  body: [],
  values: [],
  process: [],
};

test("About migration content prefers substantive CMS data and falls back when empty", () => {
  const emptyCmsPage: CmsAboutPage = {
    ...fallbackAboutPage,
    id: 10,
    title: "About",
    intro: "",
  };
  const populatedCmsPage: CmsAboutPage = {
    ...emptyCmsPage,
    intro: "Published introduction",
  };

  assert.equal(resolveAboutPage(null, fallbackAboutPage), fallbackAboutPage);
  assert.equal(resolveAboutPage(emptyCmsPage, fallbackAboutPage), fallbackAboutPage);
  assert.equal(resolveAboutPage(populatedCmsPage, fallbackAboutPage), populatedCmsPage);
});

const fallbackCollaborator: CmsCollaborator = {
  id: -1,
  organizationName: "Fallback organisation",
  logo: { url: "/logo.svg", width: 200, height: 80, alt: "Fallback logo" },
  url: "https://fallback.example.com",
  displayOrder: 1,
  visualVariant: "default",
};

test("collaborator migration content uses CMS as a complete replacement when available", () => {
  const fallback = [fallbackCollaborator];
  const cms = [{ ...fallbackCollaborator, id: 9, organizationName: "CMS organisation" }];

  assert.equal(resolveCollaborators([], fallback), fallback);
  assert.equal(resolveCollaborators(cms, fallback), cms);
});

test("homepage collaborator configuration is authoritative, including an empty selection", () => {
  const fallback = [fallbackCollaborator];
  const legacyHome = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
    },
    apiUrl,
  );
  const configuredHome = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
      collaborators_enabled: true,
      collaborators_heading: "Selected partners",
      collaborators: [],
    },
    apiUrl,
  );

  assert.equal(legacyHome?.collaboratorsConfigured, false);
  assert.equal(resolveHomeCollaborators(legacyHome, [], fallback), fallback);
  assert.deepEqual(
    resolveHomeCollaborators(configuredHome, [], fallback),
    [],
  );
});

test("homepage testimonial configuration is authoritative, including an empty selection", () => {
  const legacyTestimonials = parseTestimonials([
    { id: 5, quote: "Legacy CMS testimonial", person: "Legacy client" },
  ]);
  const legacyHome = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
    },
    apiUrl,
  );
  const configuredHome = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
      testimonials_enabled: true,
      testimonials_heading: "Selected perspectives",
      testimonials: [],
    },
    apiUrl,
  );

  assert.equal(legacyHome?.testimonialsConfigured, false);
  assert.equal(
    resolveHomeTestimonials(legacyHome, legacyTestimonials),
    legacyTestimonials,
  );
  assert.deepEqual(
    resolveHomeTestimonials(configuredHome, legacyTestimonials),
    [],
  );
});

test("empty homepage service and work selections do not expand to available items", () => {
  const available = [{ id: 7, title: "Available item" }];

  assert.deepEqual(resolveSelectedHomeItems([], available), []);
  assert.deepEqual(
    resolveSelectedHomeItems(
      [{ id: 7, title: "Selected item", slug: "selected-item" }],
      available,
    ),
    available,
  );
});

const fallbackStandardPage: CmsStandardPage = {
  id: -2,
  kind: "standard",
  title: "Fallback legal page",
  meta: {
    type: "fallback.StandardPage",
    slug: "privacy",
    seoTitle: "",
    searchDescription: "",
  },
  socialImage: null,
  body: [{ type: "rich_text", value: "<p>Fallback copy</p>" }],
};

test("legal migration pages prefer non-empty StandardPage content and retain draft fallback", () => {
  const emptyCmsPage: CmsStandardPage = {
    ...fallbackStandardPage,
    id: 11,
    title: "Published title only",
    body: [],
  };
  const populatedCmsPage: CmsStandardPage = {
    ...emptyCmsPage,
    body: [{ type: "rich_text", value: "<p>Published copy</p>" }],
  };

  assert.equal(resolveStandardPage(null, fallbackStandardPage), fallbackStandardPage);
  assert.equal(resolveStandardPage(emptyCmsPage, fallbackStandardPage), fallbackStandardPage);
  assert.equal(resolveStandardPage(populatedCmsPage, fallbackStandardPage), populatedCmsPage);
});
