export const PUBLIC_CONSENT_STORAGE_KEY = "labio-public-consent";
export const PUBLIC_CONSENT_VERSION = 1;
export const PUBLIC_CONSENT_CHANGE_EVENT = "labio:consent-change";
export const PUBLIC_CONSENT_OPEN_EVENT = "labio:consent-open";

export type PublicConsentCategory =
  | "essential"
  | "analytics"
  | "marketing"
  | "externalMedia";

export type PublicConsent = {
  version: typeof PUBLIC_CONSENT_VERSION;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  externalMedia: boolean;
};

export type PublicConsentView = "hidden" | "banner" | "preferences";

type ReadableConsentStorage = {
  getItem(key: string): string | null;
};

type WritableConsentStorage = {
  setItem(key: string, value: string): void;
};

export function createPublicConsent(
  optional: Pick<PublicConsent, "analytics" | "marketing" | "externalMedia">,
): PublicConsent {
  return {
    version: PUBLIC_CONSENT_VERSION,
    essential: true,
    analytics: optional.analytics,
    marketing: optional.marketing,
    externalMedia: optional.externalMedia,
  };
}

export function acceptAllPublicConsent(): PublicConsent {
  return createPublicConsent({
    analytics: true,
    marketing: true,
    externalMedia: true,
  });
}

export function rejectNonEssentialPublicConsent(): PublicConsent {
  return createPublicConsent({
    analytics: false,
    marketing: false,
    externalMedia: false,
  });
}

export function parsePublicConsent(value: string | null): PublicConsent | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (
      record.version !== PUBLIC_CONSENT_VERSION
      || typeof record.analytics !== "boolean"
      || typeof record.marketing !== "boolean"
      || typeof record.externalMedia !== "boolean"
    ) {
      return null;
    }
    return createPublicConsent({
      analytics: record.analytics,
      marketing: record.marketing,
      externalMedia: record.externalMedia,
    });
  } catch {
    return null;
  }
}

export function readPublicConsent(
  storage: ReadableConsentStorage,
): PublicConsent | null {
  return parsePublicConsent(storage.getItem(PUBLIC_CONSENT_STORAGE_KEY));
}

export function persistPublicConsent(
  storage: WritableConsentStorage,
  consent: PublicConsent,
): void {
  storage.setItem(PUBLIC_CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

export function hasPublicConsent(
  consent: PublicConsent | null,
  category: PublicConsentCategory,
): boolean {
  return category === "essential" || Boolean(consent?.[category]);
}

export function getPublicConsentView(
  consent: PublicConsent | null | undefined,
  preferencesOpen: boolean,
): PublicConsentView {
  if (preferencesOpen) return "preferences";
  return consent === null ? "banner" : "hidden";
}
