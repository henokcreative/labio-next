import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAboutPage,
  parseArticlePage,
  parseCaseStudyPage,
  parseCollaborators,
  parseEventPage,
  parseHomePage,
  parsePricingPage,
  parseServicePage,
  parseStreamField,
  parseTestimonials,
  parseUpdatesIndexPage,
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
  resolveHomeLatestUpdates,
  resolveHomeTestimonials,
  resolveSelectedHomeItems,
  resolveStandardPage,
} from "./public-content";
import {
  formatEventSchedule,
  formatPublicDate,
  updateTypeLabel,
} from "./public-updates";


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
      updates_enabled: true,
      updates_eyebrow: "From LaBio",
      updates_heading: "A few notes, ideas and milestones.",
      updates_item_count: 3,
      updates_cta_label: "View all updates",
      updates_cta_url: "/updates",
      latest_updates: [
        {
          id: 11,
          title: "Latest insight",
          slug: "latest-insight",
          kind: "article",
          article_type: "insight",
          article_type_label: "Insight",
          summary: "A current note.",
          publication_date: "2026-08-21",
          featured: false,
          featured_image: null,
        },
      ],
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
  assert.equal(page?.updatesEnabled, true);
  assert.equal(page?.updatesEyebrow, "From LaBio");
  assert.equal(page?.updatesItemCount, 3);
  assert.equal(page?.updatesCta.url, "/updates");
  assert.equal(page?.latestUpdates[0].slug, "latest-insight");
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
      client_display_name: "Research Institute",
      category: "Photography",
      summary: "A public case study",
      project_year: "2025",
      challenge: "Make the research visible.",
      approach: "Work closely with the research team.",
      deliverables: [
        { type: "deliverable", value: "Editorial photography" },
        { type: "unknown", value: "Ignore this" },
        { type: "deliverable", value: " " },
      ],
      outcome: "A reusable visual library.",
      project_url: "https://project.example.com",
      cta_label: "Discuss a project",
      cta_url: "/contact",
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
  assert.equal(project?.clientDisplayName, "Research Institute");
  assert.equal(project?.projectYear, "2025");
  assert.equal(project?.challenge, "Make the research visible.");
  assert.equal(project?.approach, "Work closely with the research team.");
  assert.deepEqual(project?.deliverables, ["Editorial photography"]);
  assert.equal(project?.outcome, "A reusable visual library.");
  assert.equal(project?.projectUrl, "https://project.example.com");
  assert.deepEqual(project?.cta, { label: "Discuss a project", url: "/contact" });
});

test("case-study editorial additions stay optional and reject unsafe links", () => {
  const project = parseCaseStudyPage(
    {
      id: 9,
      title: "Small project",
      meta: { ...meta, type: "public_content.CaseStudyPage", slug: "small-project" },
      project_url: "javascript:alert(1)",
      cta_label: "Unsafe CTA",
      cta_url: "javascript:alert(1)",
    },
    apiUrl,
  );

  assert.equal(project?.clientDisplayName, "");
  assert.equal(project?.summary, "");
  assert.equal(project?.projectYear, "");
  assert.equal(project?.challenge, "");
  assert.equal(project?.approach, "");
  assert.deepEqual(project?.deliverables, []);
  assert.equal(project?.outcome, "");
  assert.equal(project?.projectUrl, "");
  assert.deepEqual(project?.cta, { label: "Unsafe CTA", url: "" });
});

test("updates index preserves backend article and event ordering", () => {
  const page = parseUpdatesIndexPage(
    {
      id: 20,
      title: "Updates",
      meta: {
        ...meta,
        type: "public_content.UpdatesIndexPage",
        slug: "updates",
      },
      articles: [
        {
          id: 21,
          title: "Newest insight",
          slug: "newest-insight",
          kind: "article",
          article_type: "insight",
          article_type_label: "Insight",
          summary: "A current note.",
          publication_date: "2026-08-20",
          featured: true,
          featured_image: {
            url: "/media/insight.jpg",
            width: 1200,
            height: 675,
            alt: "Insight image",
          },
        },
        {
          id: 22,
          title: "Earlier milestone",
          slug: "earlier-milestone",
          kind: "article",
          article_type: "milestone",
          summary: "An earlier note.",
          publication_date: "2026-08-10",
          featured: false,
        },
      ],
      upcoming_events: [
        {
          id: 23,
          title: "Nearest event",
          slug: "nearest-event",
          kind: "event",
          summary: "An upcoming event.",
          start_date: "2026-09-01",
          start_time: "09:30:00",
          location: "Turku",
          registration_url: "https://events.example.com/register",
          featured: false,
        },
        {
          id: 24,
          title: "Later event",
          slug: "later-event",
          kind: "event",
          summary: "A later event.",
          start_date: "2026-10-01",
          location: "Helsinki",
          registration_url: "",
          featured: false,
        },
      ],
      past_events: [
        {
          id: 25,
          title: "Past event",
          slug: "past-event",
          kind: "event",
          summary: "An archived event.",
          start_date: "2026-07-01",
          location: "Turku",
          registration_url: "",
          featured: false,
        },
      ],
    },
    apiUrl,
  );

  assert.deepEqual(page?.articles.map((item) => item.slug), [
    "newest-insight",
    "earlier-milestone",
  ]);
  assert.equal(page?.articles[0].featuredImage?.url, "https://api.example.com/media/insight.jpg");
  assert.deepEqual(page?.upcomingEvents.map((item) => item.slug), [
    "nearest-event",
    "later-event",
  ]);
  assert.deepEqual(page?.pastEvents.map((item) => item.slug), ["past-event"]);
});

test("article detail parser reuses controlled image and StreamField data", () => {
  const page = parseArticlePage(
    {
      id: 30,
      title: "A research insight",
      meta: {
        ...meta,
        type: "public_content.ArticlePage",
        slug: "research-insight",
      },
      article_type: "insight",
      summary: "A concise article summary.",
      featured_image: {
        url: "/media/article.jpg",
        width: 1600,
        height: 900,
        alt: "Research team",
      },
      publication_date: "2026-08-20",
      featured: true,
      body: [{ type: "rich_text", value: "<p>Published body.</p>" }],
    },
    apiUrl,
  );

  assert.equal(page?.kind, "article");
  assert.equal(page?.articleTypeLabel, "Insight");
  assert.equal(page?.featuredImage?.alt, "Research team");
  assert.equal(page?.body[0].type, "rich_text");
});

test("event detail parser keeps optional schedule data and sanitizes registration links", () => {
  const page = parseEventPage(
    {
      id: 40,
      title: "Research communication event",
      meta: {
        ...meta,
        type: "public_content.EventPage",
        slug: "research-event",
      },
      summary: "A concise event summary.",
      start_date: "2026-09-12",
      start_time: "10:00:00",
      end_date: "2026-09-12",
      end_time: "12:00:00",
      location: "Turku, Finland",
      registration_url: "javascript:alert(1)",
      featured: false,
      body: [{ type: "heading", value: { text: "Programme", level: "h2" } }],
    },
    apiUrl,
  );

  assert.equal(page?.kind, "event");
  assert.equal(page?.startTime, "10:00:00");
  assert.equal(page?.endTime, "12:00:00");
  assert.equal(page?.location, "Turku, Finland");
  assert.equal(page?.registrationUrl, "");
  assert.equal(page?.body[0].type, "heading");
});

test("updates presentation helpers format editorial dates and labels", () => {
  const event = {
    id: 41,
    title: "Event",
    slug: "event",
    kind: "event" as const,
    summary: "Summary",
    featured: false,
    featuredImage: null,
    startDate: "2026-09-12",
    startTime: "10:00:00",
    endDate: "2026-09-12",
    endTime: "12:00:00",
    location: "Turku",
    registrationUrl: "",
  };

  assert.equal(formatPublicDate("2026-09-12"), "12 September 2026");
  assert.equal(formatEventSchedule(event), "12 September 2026 · 10:00–12:00");
  assert.equal(updateTypeLabel(event), "Event");
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
  pageEyebrow: "About LaBio Media",
  intro: "Fallback introduction",
  body: [],
  valuesLabel: "Values",
  values: [],
  processLabel: "How we work",
  process: [],
  testimonialsEnabled: false,
  testimonialsHeading: "Client perspectives",
  testimonials: [],
};

test("About parser preserves the editorial portrait and selected testimonials", () => {
  const page = parseAboutPage(
    {
      id: 12,
      title: "About",
      meta: { ...meta, type: "public_content.AboutPage", slug: "about" },
      hero_image: {
        url: "/media/portrait.jpg",
        width: 800,
        height: 800,
        alt: "Founder portrait",
      },
      page_eyebrow: "About LaBio Media",
      intro: "Scientific understanding meets creative communication.",
      values_label: "Values",
      process_label: "How we work",
      testimonials_enabled: true,
      testimonials_heading: "Selected perspectives",
      testimonials: [
        {
          id: 8,
          quote: "Thoughtful and clear.",
          person: "Research partner",
          role: "Director",
          organization: "Institute",
        },
      ],
    },
    apiUrl,
  );

  assert.equal(page?.heroImage?.alt, "Founder portrait");
  assert.equal(page?.pageEyebrow, "About LaBio Media");
  assert.equal(page?.valuesLabel, "Values");
  assert.equal(page?.processLabel, "How we work");
  assert.equal(page?.testimonialsEnabled, true);
  assert.equal(page?.testimonialsHeading, "Selected perspectives");
  assert.equal(page?.testimonials[0].person, "Research partner");
});

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

test("homepage latest updates respect count, disabled and empty CMS states", () => {
  const home = parseHomePage(
    {
      id: 1,
      title: "Home",
      meta,
      hero_heading: "Clear science",
      hero_copy: "Introduction",
      updates_enabled: true,
      updates_item_count: 1,
      latest_updates: [
        {
          id: 21,
          title: "Newest insight",
          slug: "newest-insight",
          kind: "article",
          article_type: "insight",
          summary: "A new note.",
          publication_date: "2026-08-21",
        },
        {
          id: 22,
          title: "Research event",
          slug: "research-event",
          kind: "event",
          summary: "An upcoming event.",
          start_date: "2026-09-01",
        },
      ],
    },
    apiUrl,
  );

  assert.ok(home);
  assert.deepEqual(
    resolveHomeLatestUpdates(home).map((item) => item.slug),
    ["newest-insight"],
  );
  assert.deepEqual(resolveHomeLatestUpdates({ ...home, updatesEnabled: false }), []);
  assert.deepEqual(resolveHomeLatestUpdates({ ...home, latestUpdates: [] }), []);
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
