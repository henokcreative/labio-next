import type { CmsNavigationLink } from "./cms-types";

export const FALLBACK_PUBLIC_NAVIGATION: CmsNavigationLink[] = [
  { label: "Home", href: "/", external: false },
  { label: "Work", href: "/work", external: false },
  { label: "Services", href: "/services", external: false },
  { label: "About", href: "/about", external: false },
  { label: "Contact", href: "/contact", external: false },
  { label: "Pricing", href: "/pricing", external: false },
];

export function resolvePublicNavigation(
  cmsLinks: CmsNavigationLink[] | null | undefined,
): CmsNavigationLink[] {
  return cmsLinks && cmsLinks.length > 0
    ? cmsLinks
    : FALLBACK_PUBLIC_NAVIGATION;
}
