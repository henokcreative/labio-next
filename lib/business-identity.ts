import type { CmsSiteSettings } from "./cms-types";

const BUSINESS_IDENTITY_PAGES = new Set(["privacy", "cookies", "terms"]);

export type PublicBusinessIdentity = {
  legalBusinessName: string;
  businessId: string;
  location: string;
  fullAddress: string;
  publicContactEmail: string;
  publicPhone: string;
  phoneHref: string;
  footerLine: string;
  hasDetails: boolean;
};

export function isBusinessIdentityLegalPage(slug: string): boolean {
  return BUSINESS_IDENTITY_PAGES.has(slug);
}

export function resolveBusinessIdentity(
  settings: CmsSiteSettings | null,
): PublicBusinessIdentity {
  const legalBusinessName = settings?.legalBusinessName.trim() ?? "";
  const businessId = settings?.businessId.trim() ?? "";
  const city = settings?.city.trim() ?? "";
  const country = settings?.country.trim() ?? "";
  const location = [city, country].filter(Boolean).join(", ");
  const address = settings?.address.trim() ?? "";
  const fullAddress = address && address.toLocaleLowerCase() !== location.toLocaleLowerCase()
    ? [address, location].filter(Boolean).join("\n")
    : address || location;
  const publicContactEmail = settings?.publicContactEmail.trim() ?? "";
  const publicPhone = settings?.publicPhone.trim() ?? "";
  const phoneHref = publicPhone.replace(/(?!^)\+|[^\d+]/g, "");
  const footerLine = [
    legalBusinessName,
    businessId ? `Business ID ${businessId}` : "",
    location,
  ].filter(Boolean).join(" · ");

  return {
    legalBusinessName,
    businessId,
    location,
    fullAddress,
    publicContactEmail,
    publicPhone,
    phoneHref,
    footerLine,
    hasDetails: Boolean(
      legalBusinessName
        || businessId
        || fullAddress
        || publicContactEmail
        || publicPhone,
    ),
  };
}
