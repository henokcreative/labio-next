import type { CmsCaseStudyShowcaseBlock } from "./cms-types";

type CmsCaseStudyVideoBlock = Extract<
  CmsCaseStudyShowcaseBlock,
  { type: "video" }
>;

export type CmsCaseStudyShowcaseGroup =
  | { type: "block"; block: Exclude<CmsCaseStudyShowcaseBlock, CmsCaseStudyVideoBlock> }
  | { type: "video_grid"; blocks: CmsCaseStudyVideoBlock[] };

export function groupCaseStudyShowcaseBlocks(
  blocks: CmsCaseStudyShowcaseBlock[],
): CmsCaseStudyShowcaseGroup[] {
  const groups: CmsCaseStudyShowcaseGroup[] = [];

  blocks.forEach((block) => {
    if (block.type !== "video") {
      groups.push({ type: "block", block });
      return;
    }

    const previousGroup = groups.at(-1);
    if (previousGroup?.type === "video_grid") {
      previousGroup.blocks.push(block);
      return;
    }

    groups.push({ type: "video_grid", blocks: [block] });
  });

  return groups;
}

const LEGACY_GALLERY_REPLACEMENT_TYPES = new Set<
  CmsCaseStudyShowcaseBlock["type"]
>([
  "photo_slider",
  "masonry_gallery",
  "image_grid",
  "image_pair",
  "website_preview_grid",
  "wide_image",
]);

export function shouldUseLegacyCaseStudyGallery(
  showcase: CmsCaseStudyShowcaseBlock[],
): boolean {
  return !showcase.some((block) =>
    LEGACY_GALLERY_REPLACEMENT_TYPES.has(block.type),
  );
}

export function shouldUseLegacyCaseStudyEmbed(
  showcase: CmsCaseStudyShowcaseBlock[],
): boolean {
  return !showcase.some((block) => block.type === "video");
}

export function nextSlideIndex(
  currentIndex: number,
  slideCount: number,
  direction: -1 | 1,
): number {
  if (slideCount <= 1) return 0;
  return (currentIndex + direction + slideCount) % slideCount;
}
