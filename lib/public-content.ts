import type {
  CmsAboutPage,
  CmsCollaborator,
  CmsStandardPage,
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

export function resolveStandardPage(
  cmsPage: CmsStandardPage | null,
  fallbackPage: CmsStandardPage | null,
): CmsStandardPage | null {
  if (!fallbackPage) return cmsPage;
  return cmsPage && cmsPage.body.length > 0 ? cmsPage : fallbackPage;
}
