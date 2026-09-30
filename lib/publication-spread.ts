export function publicationSpread(page: number, total: number, wide: boolean): number[] {
  if (!wide || page === 1) return [page];
  const first = page % 2 === 0 ? page : page - 1;
  return first < total ? [first, first + 1] : [first];
}

export function movePublication(page: number, total: number, direction: number, wide: boolean): number {
  const spread = publicationSpread(page, total, wide);
  if (direction > 0) return Math.min(total, spread[spread.length - 1] + 1);
  return Math.max(1, spread[0] - (wide && spread[0] > 2 ? 2 : 1));
}
