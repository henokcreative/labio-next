import type { CmsSiteSettings } from "./cms-types";
import { publicSiteUrl } from "./public-url";

export function organizationSchema(settings: CmsSiteSettings | null) {
  const legalName = settings?.legalBusinessName.trim() || "LaBio Media";
  const sameAs = (settings?.socialLinks ?? []).map((link) => link.url).filter(Boolean);
  const address = settings
    ? {
        "@type": "PostalAddress",
        ...(settings.address ? { streetAddress: settings.address } : {}),
        ...(settings.city ? { addressLocality: settings.city } : {}),
        ...(settings.country ? { addressCountry: settings.country } : {}),
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${publicSiteUrl("/")}#organization`,
    name: "LaBio Media",
    legalName,
    url: publicSiteUrl("/"),
    ...(settings?.businessId
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "Finnish Business ID",
            value: settings.businessId,
          },
        }
      : {}),
    ...(settings?.publicContactEmail ? { email: settings.publicContactEmail } : {}),
    ...(settings?.publicPhone ? { telephone: settings.publicPhone } : {}),
    ...(address && (settings?.address || settings?.city || settings?.country)
      ? { address }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
