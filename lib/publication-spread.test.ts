import assert from "node:assert/strict";
import test from "node:test";
import { movePublication, publicationSpread } from "./publication-spread";

test("cover and spreads preserve every page for odd and even totals", () => {
  for (const total of [1, 2, 3, 8, 9, 100]) {
    const visited: number[] = [];
    let page = 1;
    while (true) {
      const spread = publicationSpread(page, total, true);
      visited.push(...spread);
      if (spread.includes(total)) break;
      page = movePublication(page, total, 1, true);
    }
    assert.deepEqual(visited, Array.from({ length: total }, (_, i) => i + 1));
    assert.equal(movePublication(page, total, 1, true), total);
  }
  assert.equal(movePublication(4, 9, -1, true), 2);
  assert.equal(movePublication(2, 9, -1, true), 1);
  assert.equal(movePublication(1, 9, -1, true), 1);
});

test("mobile and Reader move singly; switching modes retains the selected page", () => {
  assert.deepEqual(publicationSpread(5, 10, false), [5]);
  assert.deepEqual(publicationSpread(5, 10, true), [4, 5]);
  assert.equal(movePublication(5, 10, 1, false), 6);
  assert.equal(movePublication(5, 10, -1, false), 4);
  assert.equal(movePublication(5, 10, 1, true), 6);
  assert.deepEqual(publicationSpread(10, 10, true), [10]);
});
