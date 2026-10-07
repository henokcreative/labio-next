import type { CmsPricingItem } from "./cms-types";

export function groupPricingItems(items: CmsPricingItem[]) {
  // Temporary CMS ordering convention until items have an explicit section field.
  // The first featured item divides core and additional offers; retain all featured items.
  const boundary = items.findIndex(item => item.featured);
  const indexed = items.map((item, index) => ({ item, index }));
  return {
    core: indexed.filter(({ item, index }) => !item.featured && (boundary < 0 || index < boundary)),
    integrated: indexed.filter(({ item }) => item.featured),
    additional: indexed.filter(({ item, index }) => !item.featured && boundary >= 0 && index > boundary),
  };
}
