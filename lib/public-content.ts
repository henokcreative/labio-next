import type {
  CmsAboutPage,
  CmsCollaborator,
  CmsHomePage,
  CmsPageSummary,
  CmsStandardPage,
  CmsTestimonial,
  CmsUpdateSummary,
} from "./cms-types";

export function resolveAboutPage(
  cmsPage: CmsAboutPage | null,
  fallbackPage: CmsAboutPage,
): CmsAboutPage {
  if (!cmsPage) return fallbackPage;

  const hasPublishedContent = Boolean(
    cmsPage.intro.trim()
      || cmsPage.body.length
      || cmsPage.values.length
      || cmsPage.process.length
      || cmsPage.heroImage,
  );
  return hasPublishedContent ? cmsPage : fallbackPage;
}

export function resolveCollaborators(
  cmsCollaborators: CmsCollaborator[],
  fallbackCollaborators: CmsCollaborator[],
): CmsCollaborator[] {
  return cmsCollaborators.length > 0
    ? cmsCollaborators
    : fallbackCollaborators;
}

export function resolveHomeCollaborators(
  cmsHome: CmsHomePage | null,
  cmsCollaborators: CmsCollaborator[],
  fallbackCollaborators: CmsCollaborator[],
): CmsCollaborator[] {
  if (cmsHome?.collaboratorsConfigured) {
    return cmsHome.collaborators;
  }
  return resolveCollaborators(cmsCollaborators, fallbackCollaborators);
}

export function resolveSelectedHomeItems<T extends { id: number }>(
  selectedItems: CmsPageSummary[],
  availableItems: T[],
): T[] {
  return selectedItems
    .map((summary) => availableItems.find((item) => item.id === summary.id))
    .filter((item): item is T => Boolean(item));
}

export function resolveHomeTestimonials(
  cmsHome: CmsHomePage | null,
  cmsTestimonials: CmsTestimonial[],
): CmsTestimonial[] {
  if (cmsHome?.testimonialsConfigured) {
    return cmsHome.testimonials;
  }
  return cmsTestimonials;
}

export function resolveHomeLatestUpdates(
  home: CmsHomePage,
): CmsUpdateSummary[] {
  if (!home.updatesEnabled || home.updatesItemCount < 1) return [];
  return home.latestUpdates.slice(0, home.updatesItemCount);
}

export function resolveStandardPage(
  cmsPage: CmsStandardPage | null,
  fallbackPage: CmsStandardPage | null,
): CmsStandardPage | null {
  if (!fallbackPage) return cmsPage;
  return cmsPage && cmsPage.body.length > 0 ? cmsPage : fallbackPage;
}
