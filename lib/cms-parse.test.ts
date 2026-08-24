import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAboutPage,
  parseArticlePage,
  parseCaseStudyPage,
  parseCollaborators,
  parseContactPage,
  parseEventPage,
  parseHomePage,
  parsePricingPage,
  parseServicePage,
  parseSiteSettings,
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
  isBusinessIdentityLegalPage,
  resolveBusinessIdentity,
} from "./business-identity";
import { formatOfferPrice } from "./pricing";
import {
  resolveAboutPage,
  resolveCollaborators,
  resolveHomeCollaborators,
  resolveHomeLatestUpdates,
  resolveCmsCollection,
  resolveHomeTestimonials,
  resolveSelectedHomeItems,
  resolveStandardPage,
} from "./public-content";
import {
  formatEventSchedule,
  formatPublicDate,
  updateTypeLabel,
} from "./public-updates";
import {
  FALLBACK_PUBLIC_NAVIGATION,
  resolvePublicNavigation,
} from "./public-navigation";
import {
  groupCaseStudyShowcaseBlocks,
  nextSlideIndex,
  shouldUseLegacyCaseStudyMedia,
} from "./case-study-showcase";


const apiUrl = "https://api.example.com";
const meta = {
  type: "public_content.HomePage",
  slug: "home",
  seo_title: "Public title",
  search_description: "Public description",
};

test("business identity supports compact footer and full legal/contact details", () => {
  const settings = parseSiteSettings(
    {
      legal_business_name: "LaBio Media Oy",
      business_id: "1234567-8",
      city: "Turku",
      country: "Finland",
      public_contact_email: "hello@example.com",
      public_phone: "+358 40 123 4567",
      address: "Example Street 1",
    },
    apiUrl,
  );
  const identity = resolveBusinessIdentity(settings);

  assert.equal(
    identity.footerLine,
    "LaBio Media Oy · Business ID 1234567-8 · Turku, Finland",
  );
  assert.equal(identity.fullAddress, "Example Street 1\nTurku, Finland");
  assert.equal(identity.publicContactEmail, "hello@example.com");
  assert.equal(identity.phoneHref, "+358401234567");
  assert.equal(identity.hasDetails, true);
  assert.equal(isBusinessIdentityLegalPage("privacy"), true);
  assert.equal(isBusinessIdentityLegalPage("cookies"), true);
  assert.equal(isBusinessIdentityLegalPage("terms"), true);
  assert.equal(isBusinessIdentityLegalPage("about"), false);

  const emptyIdentity = resolveBusinessIdentity(parseSiteSettings({}, apiUrl));
  assert.equal(emptyIdentity.footerLine, "");
  assert.equal(emptyIdentity.hasDetails, false);
});

test("site settings parse ordered public navigation and resolve page destinations", () => {
  const settings = parseSiteSettings(
    {
      navigation_links: [
        {
          label: "Work",
          url: "",
          page: {
            id: 2,
            title: "Work",
            slug: "work",
            type: "public_content.PortfolioIndexPage",
          },
          external: false,
        },
        {
          label: "Journal",
          url: "https://journal.example.com",
          page: null,
          external: true,
        },
        {
          label: "Unsafe",
          url: "javascript:alert(1)",
          page: null,
          external: true,
        },
      ],
    },
    apiUrl,
  );

  assert.deepEqual(settings?.navigationLinks, [
    { label: "Work", href: "/work", external: false },
    { label: "Journal", href: "https://journal.example.com", external: true },
  ]);
});

test("public navigation keeps rollout-safe defaults for missing or empty CMS data", () => {
  assert.deepEqual(resolvePublicNavigation(null), FALLBACK_PUBLIC_NAVIGATION);
  assert.deepEqual(resolvePublicNavigation([]), FALLBACK_PUBLIC_NAVIGATION);
  assert.deepEqual(
    resolvePublicNavigation([
      { label: "Updates", href: "/updates", external: false },
    ]),
    [{ label: "Updates", href: "/updates", external: false }],
  );
});

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
          pricing_mode: "fixed",
          currency: "€",
          price_label: "400",
          description: "A shoot",
          ideal_for: "Research teams",
          features: ["Planning", 7, "Delivery"],
          context: "Travel is scoped separately.",
          cta_label: "Quote",
          cta_url: "/#contact",
          featured: true,
          related_services: [
            { id: 4, title: "Photography", slug: "photography" },
          ],
          related_case_studies: [
            { id: 5, title: "A research story", slug: "a-research-story" },
          ],
        },
      ],
      positioning_message: "Scoped individually.",
    },
    apiUrl,
  );

  assert.deepEqual(page?.items[0].features, ["Planning", "Delivery"]);
  assert.equal(page?.items[0].pricingMode, "fixed");
  assert.equal(page?.items[0].currency, "€");
  assert.equal(page?.items[0].idealFor, "Research teams");
  assert.equal(page?.items[0].context, "Travel is scoped separately.");
  assert.equal(page?.items[0].featured, true);
  assert.equal(page?.items[0].relatedServices[0].slug, "photography");
  assert.equal(page?.items[0].relatedCaseStudies[0].slug, "a-research-story");
  assert.equal(page?.items[0].cta.url, "/#contact");
  assert.deepEqual(parsePricingPage({ id: 8, title: "Pricing", meta }, apiUrl)?.items, []);
});

test("pricing modes format structured and legacy CMS labels without inventing prices", () => {
  assert.equal(formatOfferPrice({
    pricingMode: "starting_from",
    currency: "€",
    priceLabel: "1,500",
  }), "From €1,500");
  assert.equal(formatOfferPrice({
    pricingMode: "fixed",
    currency: "EUR",
    priceLabel: "1,500",
  }), "EUR 1,500");
  assert.equal(formatOfferPrice({
    pricingMode: "custom",
    currency: "",
    priceLabel: "Let’s talk",
  }), "Let’s talk");
  assert.equal(formatOfferPrice({
    pricingMode: "starting_from",
    currency: "€",
    priceLabel: "From €400",
  }), "From €400");
  assert.equal(formatOfferPrice({
    pricingMode: "starting_from",
    currency: "€",
    priceLabel: "[MOCK] From €1,500",
  }), "[MOCK] From €1,500");
  assert.equal(formatOfferPrice({
    pricingMode: "fixed",
    currency: "€",
    priceLabel: "",
  }), "");
});

test("pricing parser keeps intentionally empty optional offer fields empty", () => {
  const page = parsePricingPage(
    {
      id: 8,
      title: "Pricing",
      meta: { ...meta, type: "public_content.PricingPage", slug: "pricing" },
      pricing_items: [
        {
          id: 10,
          title: "Custom project",
          pricing_mode: "unsupported",
          price_label: "",
          description: "",
        },
      ],
    },
    apiUrl,
  );

  assert.deepEqual(page?.items[0], {
    id: 10,
    title: "Custom project",
    pricingMode: "starting_from",
    currency: "",
    priceLabel: "",
    description: "",
    idealFor: "",
    features: [],
    context: "",
    cta: { label: "", url: "" },
    featured: false,
    relatedServices: [],
    relatedCaseStudies: [],
  });
});

test("service and work payloads retain only controlled route data", () => {
  const service = parseServicePage(
    {
      id: 2,
      title: "Photography",
      meta: { ...meta, type: "public_content.ServicePage", slug: "photography" },
      summary: "Research photography",
      hero_image: {
        url: "/media/obsolete-service-hero.jpg",
        width: 1600,
        height: 900,
        alt: "Obsolete service hero",
      },
      capabilities: [
        { type: "capability", value: { title: "Portraits", description: "On location" } },
        { type: "unknown", value: { title: "Ignored" } },
      ],
      testimonials_enabled: true,
      testimonials_heading: "Selected perspectives",
      testimonials: [
        {
          id: 8,
          quote: "Thoughtful work.",
          person: "Research client",
          role: "Director",
          organization: "Institute",
        },
      ],
      related_work_enabled: true,
      related_work_heading: "Selected projects",
      cta_heading: "Discuss your research",
      related_case_studies: [
        {
          id: 3,
          title: "A study",
          slug: "a-study",
          summary: "A public case study",
          category: "Photography",
          hero_image: {
            url: "/media/work.jpg",
            width: 900,
            height: 600,
            alt: "Work",
          },
        },
      ],
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
  assert.equal(
    Object.prototype.hasOwnProperty.call(service, "heroImage"),
    false,
  );
  assert.equal(service?.relatedCaseStudies[0].slug, "a-study");
  assert.equal(
    service?.relatedCaseStudies[0].heroImage?.url,
    "https://api.example.com/media/work.jpg",
  );
  assert.equal(service?.testimonialsEnabled, true);
  assert.equal(service?.testimonialsHeading, "Selected perspectives");
  assert.equal(service?.testimonials[0].person, "Research client");
  assert.equal(service?.relatedWorkEnabled, true);
  assert.equal(service?.relatedWorkHeading, "Selected projects");
  assert.equal(service?.ctaHeading, "Discuss your research");
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

test("service sections preserve intentional disabled and empty CMS states", () => {
  const service = parseServicePage(
    {
      id: 12,
      title: "Video",
      meta: {
        ...meta,
        type: "public_content.ServicePage",
        slug: "video",
      },
      testimonials_enabled: false,
      testimonials_heading: "Client voices",
      testimonials: [],
      related_work_enabled: false,
      related_work_heading: "Research stories",
      related_case_studies: [],
      cta_heading: "Start a project",
    },
    apiUrl,
  );

  assert.equal(service?.testimonialsEnabled, false);
  assert.equal(service?.testimonialsHeading, "Client voices");
  assert.deepEqual(service?.testimonials, []);
  assert.equal(service?.relatedWorkEnabled, false);
  assert.equal(service?.relatedWorkHeading, "Research stories");
  assert.deepEqual(service?.relatedCaseStudies, []);
  assert.equal(service?.ctaHeading, "Start a project");
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

test("case-study showcase parsing preserves every R2-backed image module and safe URLs", () => {
  const renditionUrl =
    "https://media.labiomedia.com/labio-cms-media-production/cms/images/showcase.max-1600x1600.jpg";
  const image = {
    url: renditionUrl,
    width: 1200,
    height: 800,
    alt: "Showcase image",
    caption: "Editorial caption",
  };
  const project = parseCaseStudyPage(
    {
      id: 30,
      title: "Visual project",
      meta: { ...meta, type: "public_content.CaseStudyPage", slug: "visual-project" },
      showcase: [
        {
          id: "slider-1",
          type: "photo_slider",
          value: { heading: "Photography", images: [image, image] },
        },
        {
          type: "masonry_gallery",
          value: { heading: "Details", images: [image, image] },
        },
        {
          type: "image_grid",
          value: { heading: "Applications", columns: "2", images: [image] },
        },
        {
          type: "image_pair",
          value: { heading: "Pair", first_image: image, second_image: image },
        },
        {
          type: "video",
          value: {
            heading: "Film",
            url: "https://vimeo.com/123456",
            caption: "Consent-aware media",
          },
        },
        {
          type: "website_preview_grid",
          value: {
            heading: "Website views",
            items: [
              {
                image,
                label: "Homepage",
                url: "https://project.example.com",
                caption: "Desktop view",
              },
              {
                image,
                label: "Unsafe destination",
                url: "javascript:alert(1)",
              },
            ],
          },
        },
        {
          type: "wide_image",
          value: { heading: "Final image", image, caption: "Wide view" },
        },
        {
          type: "photo_slider",
          value: { heading: "Invalid slider", images: [image] },
        },
        { type: "unknown_showcase", value: { image } },
      ],
    },
    apiUrl,
  );

  assert.deepEqual(
    project?.showcase.map((block) => block.type),
    [
      "photo_slider",
      "masonry_gallery",
      "image_grid",
      "image_pair",
      "video",
      "website_preview_grid",
      "wide_image",
    ],
  );
  assert.equal(project?.showcase[0].id, "slider-1");
  assert.equal(
    project?.showcase[0].type === "photo_slider"
      ? project.showcase[0].value.images[0].url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[1].type === "masonry_gallery"
      ? project.showcase[1].value.images[0].url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[2].type === "image_grid"
      ? project.showcase[2].value.images[0].url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[3].type === "image_pair"
      ? project.showcase[3].value.firstImage.url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[5].type === "website_preview_grid"
      ? project.showcase[5].value.items[0].image.url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[6].type === "wide_image"
      ? project.showcase[6].value.image.url
      : "",
    renditionUrl,
  );
  assert.equal(
    project?.showcase[2].type === "image_grid"
      ? project.showcase[2].value.columns
      : 0,
    2,
  );
  assert.equal(
    project?.showcase[5].type === "website_preview_grid"
      ? project.showcase[5].value.items[1].url
      : "unexpected",
    "",
  );
  assert.equal(shouldUseLegacyCaseStudyMedia(project?.showcase ?? []), false);
});

test("empty showcase retains legacy media and slider controls wrap", () => {
  const project = parseCaseStudyPage(
    {
      id: 31,
      title: "Legacy project",
      meta: { ...meta, type: "public_content.CaseStudyPage", slug: "legacy-project" },
      showcase: [],
      embed_url: "https://www.youtube.com/watch?v=abc123",
      gallery: [
        {
          type: "image",
          value: { url: "/media/legacy.jpg", width: 900, height: 600, alt: "Legacy" },
        },
      ],
    },
    apiUrl,
  );

  assert.deepEqual(project?.showcase, []);
  assert.equal(shouldUseLegacyCaseStudyMedia(project?.showcase ?? []), true);
  assert.equal(project?.gallery.length, 1);
  assert.equal(project?.embedUrl, "https://www.youtube.com/watch?v=abc123");
  assert.equal(nextSlideIndex(0, 3, -1), 2);
  assert.equal(nextSlideIndex(2, 3, 1), 0);
  assert.equal(nextSlideIndex(0, 0, 1), 0);
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

test("published CMS service collections remain authoritative when empty", () => {
  const fallback = [{ id: -1, title: "Legacy service" }];
  const published = [{ id: 7, title: "Published service" }];

  assert.deepEqual(
    resolveCmsCollection({ items: published, apiAvailable: true }, fallback),
    published,
  );
  assert.deepEqual(
    resolveCmsCollection({ items: [], apiAvailable: true }, fallback),
    [],
  );
  assert.deepEqual(
    resolveCmsCollection({ items: [], apiAvailable: false }, fallback),
    fallback,
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

test("contact parser keeps CMS editorial fields and an intentionally empty body", () => {
  const contact = parseContactPage(
    {
      id: 31,
      title: "Contact",
      meta: {
        ...meta,
        type: "public_content.ContactPage",
        slug: "contact",
      },
      eyebrow: "Start a conversation",
      intro: "Tell us what you need to communicate.",
      body: [],
    },
    apiUrl,
  );

  assert.ok(contact);
  assert.equal(contact.kind, "contact");
  assert.equal(contact.eyebrow, "Start a conversation");
  assert.equal(contact.intro, "Tell us what you need to communicate.");
  assert.deepEqual(contact.body, []);
});

test("consecutive case-study videos form showcase grids without reordering blocks", () => {
  const groups = groupCaseStudyShowcaseBlocks([
    {
      id: "video-one",
      type: "video",
      value: { heading: "Film one", url: "https://vimeo.com/1", caption: "First" },
    },
    {
      id: "video-two",
      type: "video",
      value: { heading: "Film two", url: "https://vimeo.com/2", caption: "Second" },
    },
    {
      id: "image",
      type: "wide_image",
      value: {
        heading: "Still",
        image: {
          url: "https://media.example.com/still.jpg",
          width: 1200,
          height: 800,
          alt: "A still image",
        },
        caption: "",
      },
    },
    {
      id: "video-three",
      type: "video",
      value: { heading: "Film three", url: "https://vimeo.com/3", caption: "Third" },
    },
  ]);

  assert.equal(groups.length, 3);
  assert.equal(groups[0].type, "video_grid");
  assert.equal(groups[0].type === "video_grid" && groups[0].blocks.length, 2);
  assert.equal(groups[1].type, "block");
  assert.equal(groups[2].type, "video_grid");
  assert.equal(groups[2].type === "video_grid" && groups[2].blocks.length, 1);
});
