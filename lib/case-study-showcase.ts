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

export function nextSlideIndex(
  currentIndex: number,
  slideCount: number,
  direction: -1 | 1,
): number {
  if (slideCount <= 1) return 0;
  return (currentIndex + direction + slideCount) % slideCount;
}
