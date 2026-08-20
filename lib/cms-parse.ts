import type {
  CmsAboutPage,
  CmsCapability,
  CmsCaseStudyPage,
  CmsCollaborator,
  CmsHomePage,
  CmsImage,
  CmsLink,
  CmsPageBase,
  CmsPageMeta,
  CmsPageSummary,
  CmsPortfolioIndexPage,
  CmsPricingItem,
  CmsPricingPage,
  CmsProcessStep,
  CmsServiceIndexPage,
  CmsServicePage,
  CmsSiteSettings,
  CmsStandardPage,
  CmsStreamBlock,
  CmsTestimonial,
  CmsValue,
} from "./cms-types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function resolveCmsMediaUrl(value: unknown, apiBaseUrl: string): string | null {
  const rawUrl = asString(value).trim();
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl, `${apiBaseUrl.replace(/\/+$/, "")}/`);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function safeHref(value: unknown): string {
  const href = asString(value).trim();
  if (!href) return "";
  if (href.startsWith("/") || href.startsWith("#")) return href;

  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? href
      : "";
  } catch {
    return "";
  }
}

export function parseCmsImage(value: unknown, apiBaseUrl: string): CmsImage | null {
  const record = asRecord(value);
  if (!record) return null;

  const url = resolveCmsMediaUrl(record.url, apiBaseUrl);
  const width = asNumber(record.width);
  const height = asNumber(record.height);
  if (!url || width === null || height === null || width <= 0 || height <= 0) {
    return null;
  }

  const caption = asString(record.caption).trim();
  return {
    url,
    width,
    height,
    alt: asString(record.alt),
    ...(caption ? { caption } : {}),
  };
}

export function parsePageSummary(value: unknown): CmsPageSummary | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = asNumber(record.id);
  const title = asString(record.title).trim();
  const slug = asString(record.slug).trim();
  if (id === null || !title || !slug) return null;

  const summary = asString(record.summary).trim();
  const category = asString(record.category).trim();
  return {
    id,
    title,
    slug,
    ...(summary ? { summary } : {}),
    ...(category ? { category } : {}),
  };
}

function parsePageMeta(value: unknown): CmsPageMeta | null {
  const record = asRecord(value);
  if (!record) return null;
  const type = asString(record.type).trim();
  const slug = asString(record.slug).trim();
  if (!type || !slug) return null;

  const firstPublishedAt = asString(record.first_published_at).trim();
  return {
    type,
    slug,
    seoTitle: asString(record.seo_title).trim(),
    searchDescription: asString(record.search_description).trim(),
    ...(firstPublishedAt ? { firstPublishedAt } : {}),
  };
}

function parsePageBase(
  value: unknown,
  apiBaseUrl: string,
): (CmsPageBase & { raw: UnknownRecord }) | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const id = asNumber(raw.id);
  const title = asString(raw.title).trim();
  const meta = parsePageMeta(raw.meta);
  if (id === null || !title || !meta) return null;

  return {
    id,
    title,
    meta,
    socialImage: parseCmsImage(raw.social_image, apiBaseUrl),
    raw,
  };
}

function parseLink(label: unknown, url: unknown): CmsLink {
  return {
    label: asString(label).trim(),
    url: safeHref(url),
  };
}

function parseSummaries(value: unknown): CmsPageSummary[] {
  return asArray(value)
    .map(parsePageSummary)
    .filter((item): item is CmsPageSummary => item !== null);
}

export function parseStreamField(
  value: unknown,
  apiBaseUrl: string,
): CmsStreamBlock[] {
  return asArray(value).flatMap<CmsStreamBlock>((blockValue): CmsStreamBlock[] => {
    const block = asRecord(blockValue);
    if (!block) return [];
    const id = asString(block.id).trim() || undefined;
    const type = asString(block.type);

    if (type === "rich_text") {
      const html = asString(block.value);
      return html ? [{ type, value: html, ...(id ? { id } : {}) }] : [];
    }

    if (type === "embed") {
      const url = safeHref(block.value);
      return url ? [{ type, value: url, ...(id ? { id } : {}) }] : [];
    }

    if (type === "image") {
      const image = parseCmsImage(block.value, apiBaseUrl);
      return image ? [{ type, value: image, ...(id ? { id } : {}) }] : [];
    }

    const structuredValue = asRecord(block.value);
    if (!structuredValue) return [];

    if (type === "heading") {
      const text = asString(structuredValue.text).trim();
      const level = structuredValue.level === "h3" ? "h3" : "h2";
      return text
        ? [{ type, value: { text, level }, ...(id ? { id } : {}) }]
        : [];
    }

    if (type === "quote") {
      const quote = asString(structuredValue.quote).trim();
      return quote
        ? [{
            type,
            value: {
              quote,
              attribution: asString(structuredValue.attribution).trim(),
            },
            ...(id ? { id } : {}),
          }]
        : [];
    }

    if (type === "cta") {
      const link = parseLink(structuredValue.label, structuredValue.url);
      return link.label && link.url
        ? [{ type, value: link, ...(id ? { id } : {}) }]
        : [];
    }

    return [];
  });
}

function parseStructuredList<T extends CmsCapability>(
  value: unknown,
  blockType: string,
): T[] {
  return asArray(value).flatMap((blockValue) => {
    const block = asRecord(blockValue);
    if (!block || block.type !== blockType) return [];
    const structuredValue = asRecord(block.value);
    if (!structuredValue) return [];
    const title = asString(structuredValue.title).trim();
    if (!title) return [];
    const id = asString(block.id).trim();
    return [{
      title,
      description: asString(structuredValue.description).trim(),
      ...(id ? { id } : {}),
    } as T];
  });
}

export function parseHomePage(value: unknown, apiBaseUrl: string): CmsHomePage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  const heroHeading = asString(raw.hero_heading).trim();
  const heroCopy = asString(raw.hero_copy).trim();
  if (!heroHeading || !heroCopy) return null;
  const collaboratorsConfigured = Object.prototype.hasOwnProperty.call(
    raw,
    "collaborators",
  );

  return {
    ...page,
    kind: "home",
    heroEyebrow: asString(raw.hero_eyebrow).trim(),
    heroHeading,
    heroCopy,
    heroImage: parseCmsImage(raw.hero_image, apiBaseUrl),
    primaryCta: parseLink(raw.primary_cta_label, raw.primary_cta_url),
    secondaryCta: parseLink(raw.secondary_cta_label, raw.secondary_cta_url),
    selectedWork: parseSummaries(raw.selected_work),
    featuredServices: parseSummaries(raw.featured_services),
    collaboratorsConfigured,
    collaboratorsEnabled: collaboratorsConfigured
      ? asBoolean(raw.collaborators_enabled)
      : true,
    collaboratorsHeading:
      asString(raw.collaborators_heading).trim()
      || "Trusted by research groups and organisations",
    collaborators: parseCollaborators(raw.collaborators, apiBaseUrl),
    aboutHeading: asString(raw.about_heading).trim(),
    aboutCopy: asString(raw.about_copy).trim(),
    aboutImage: parseCmsImage(raw.about_image, apiBaseUrl),
    contactHeading: asString(raw.contact_heading).trim(),
    contactCopy: asString(raw.contact_copy).trim(),
    contactCta: parseLink(raw.contact_cta_label, raw.contact_cta_url),
  };
}

export function parseServiceIndexPage(
  value: unknown,
  apiBaseUrl: string,
): CmsServiceIndexPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "service-index",
    intro: parseStreamField(raw.intro, apiBaseUrl),
  };
}

export function parseServicePage(
  value: unknown,
  apiBaseUrl: string,
): CmsServicePage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "service",
    summary: asString(raw.summary).trim(),
    heroImage: parseCmsImage(raw.hero_image, apiBaseUrl),
    body: parseStreamField(raw.body, apiBaseUrl),
    capabilities: parseStructuredList(raw.capabilities, "capability"),
    process: parseStructuredList<CmsProcessStep>(raw.process, "step"),
    cta: parseLink(raw.cta_label, raw.cta_url),
    relatedCaseStudies: parseSummaries(raw.related_case_studies),
  };
}

export function parsePortfolioIndexPage(
  value: unknown,
  apiBaseUrl: string,
): CmsPortfolioIndexPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "portfolio-index",
    intro: parseStreamField(raw.intro, apiBaseUrl),
  };
}

export function parseCaseStudyPage(
  value: unknown,
  apiBaseUrl: string,
): CmsCaseStudyPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  const publicationDate = asString(raw.publication_date).trim();
  const gallery = asArray(raw.gallery).flatMap((blockValue) => {
    const block = asRecord(blockValue);
    const image = block?.type === "image"
      ? parseCmsImage(block.value, apiBaseUrl)
      : null;
    return image ? [image] : [];
  });

  return {
    ...page,
    kind: "case-study",
    clientDisplayName: asString(raw.client_display_name).trim(),
    category: asString(raw.category).trim(),
    summary: asString(raw.summary).trim(),
    body: parseStreamField(raw.body, apiBaseUrl),
    heroImage: parseCmsImage(raw.hero_image, apiBaseUrl),
    gallery,
    embedUrl: safeHref(raw.embed_url),
    services: parseSummaries(raw.services),
    ...(publicationDate ? { publicationDate } : {}),
    featured: asBoolean(raw.featured),
  };
}

export function parseAboutPage(value: unknown, apiBaseUrl: string): CmsAboutPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "about",
    heroImage: parseCmsImage(raw.hero_image, apiBaseUrl),
    intro: asString(raw.intro).trim(),
    body: parseStreamField(raw.body, apiBaseUrl),
    values: parseStructuredList<CmsValue>(raw.values, "value"),
    process: parseStructuredList<CmsProcessStep>(raw.process, "step"),
  };
}

export function parseStandardPage(
  value: unknown,
  apiBaseUrl: string,
): CmsStandardPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "standard",
    body: parseStreamField(raw.body, apiBaseUrl),
  };
}

function parsePricingItem(value: unknown): CmsPricingItem | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = asNumber(record.id);
  const title = asString(record.title).trim();
  if (id === null || !title) return null;
  return {
    id,
    title,
    priceLabel: asString(record.price_label).trim(),
    description: asString(record.description).trim(),
    features: asArray(record.features)
      .map((feature) => asString(feature).trim())
      .filter(Boolean),
    cta: parseLink(record.cta_label, record.cta_url),
  };
}

export function parsePricingPage(
  value: unknown,
  apiBaseUrl: string,
): CmsPricingPage | null {
  const base = parsePageBase(value, apiBaseUrl);
  if (!base) return null;
  const { raw, ...page } = base;
  return {
    ...page,
    kind: "pricing",
    intro: asString(raw.intro).trim(),
    items: asArray(raw.pricing_items)
      .map(parsePricingItem)
      .filter((item): item is CmsPricingItem => item !== null),
    positioningMessage: asString(raw.positioning_message).trim(),
  };
}

export function parseCollaborators(
  value: unknown,
  apiBaseUrl: string,
): CmsCollaborator[] {
  return asArray(value).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const id = asNumber(record.id);
    const logo = parseCmsImage(record.logo, apiBaseUrl);
    const organizationName = asString(record.organization_name).trim();
    const url = safeHref(record.url);
    if (id === null || !logo || !organizationName || !url) return [];
    return [{
      id,
      organizationName,
      logo,
      url,
      displayOrder: asNumber(record.display_order) ?? 0,
      visualVariant: asString(record.visual_variant).trim(),
    }];
  });
}

export function parseTestimonials(value: unknown): CmsTestimonial[] {
  return asArray(value).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const id = asNumber(record.id);
    const quote = asString(record.quote).trim();
    const person = asString(record.person).trim();
    if (id === null || !quote || !person) return [];
    return [{
      id,
      quote,
      person,
      role: asString(record.role).trim(),
      organization: asString(record.organization).trim(),
      relatedService: parsePageSummary(record.related_service),
      relatedCaseStudy: parsePageSummary(record.related_case_study),
    }];
  });
}

export function parseSiteSettings(
  value: unknown,
  apiBaseUrl: string,
): CmsSiteSettings | null {
  const record = asRecord(value);
  if (!record) return null;
  const socialLinks = asArray(record.social_links).flatMap((item) => {
    const block = asRecord(item);
    if (!block || block.type !== "social_link") return [];
    const linkValue = asRecord(block.value);
    if (!linkValue) return [];
    const link = parseLink(linkValue.label, linkValue.url);
    return link.label && link.url ? [link] : [];
  });
  return {
    publicContactEmail: asString(record.public_contact_email).trim(),
    publicPhone: asString(record.public_phone).trim(),
    address: asString(record.address).trim(),
    defaultCta: parseLink(record.default_cta_label, record.default_cta_url),
    socialLinks,
    defaultSocialImage: parseCmsImage(record.default_social_image, apiBaseUrl),
  };
}
