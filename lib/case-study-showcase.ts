import type { CmsCaseStudyShowcaseBlock } from "./cms-types";

export function shouldUseLegacyCaseStudyMedia(
  showcase: CmsCaseStudyShowcaseBlock[],
): boolean {
  return showcase.length === 0;
}

export function nextSlideIndex(
  currentIndex: number,
  slideCount: number,
  direction: -1 | 1,
): number {
  if (slideCount <= 1) return 0;
  return (currentIndex + direction + slideCount) % slideCount;
}
