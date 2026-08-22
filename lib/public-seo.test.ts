import assert from "node:assert/strict";
import test from "node:test";
import type { CmsPageBase, CmsSiteSettings } from "./cms-types";
import { pageMetadata } from "./public-metadata";
import { organizationSchema } from "./public-schema";
import { publicSiteUrl } from "./public-url";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

test.afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

test("publicSiteUrl accepts a valid site origin and rejects unsafe protocols", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.labiomedia.com/ignored?value=1";
  assert.equal(publicSiteUrl("/work/example"), "https://www.labiomedia.com/work/example");

  process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";
  assert.equal(publicSiteUrl("/about"), "https://labiomedia.com/about");
});

test("page metadata includes a canonical URL and matching social metadata", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://labiomedia.com";
  const page: CmsPageBase = {
    id: 1,
    title: "Research Story Video",
    meta: {
      type: "public_content.ServicePage",
      slug: "research-story-video",
      seoTitle: "",
      searchDescription: "A clear story for complex research.",
    },
    socialImage: {
      url: "https://media.labiomedia.com/social.jpg",
      width: 1200,
      height: 630,
      alt: "Research film still",
    },
  };
  const metadata = pageMetadata(page, "Service", "Fallback", null, "/services/research-story-video");

  assert.equal(metadata.title, "Research Story Video | LaBio Media");
  assert.equal(metadata.alternates?.canonical, "https://labiomedia.com/services/research-story-video");
  assert.equal(metadata.openGraph?.url, "https://labiomedia.com/services/research-story-video");
  assert.equal(
    (metadata.twitter as { card?: string } | undefined)?.card,
    "summary_large_image",
  );
});

test("organization schema exposes only public business identity fields", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://labiomedia.com";
  const settings: CmsSiteSettings = {
    legalBusinessName: "LaBio Media Oy",
    businessId: "1234567-8",
    city: "Turku",
    country: "Finland",
    publicContactEmail: "hello@example.com",
    publicPhone: "",
    address: "Example street 1",
    defaultCta: { label: "", url: "" },
    socialLinks: [{ label: "LinkedIn", url: "https://www.linkedin.com/company/example" }],
    defaultSocialImage: null,
  };
  const schema = organizationSchema(settings);

  assert.equal(schema["@type"], "ProfessionalService");
  assert.equal(schema.legalName, "LaBio Media Oy");
  assert.equal(schema.url, "https://labiomedia.com/");
  assert.deepEqual(schema.sameAs, ["https://www.linkedin.com/company/example"]);
  assert.equal("permissions" in schema, false);
});
