import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import Module, { createRequire } from "node:module";
import test from "node:test";

// Exercise the installed Next cache implementation, with only its persistence
// adapter and upstream HTTP mocked. No local server or production API is used.
globalThis.AsyncLocalStorage = AsyncLocalStorage;
const requireModule = createRequire(import.meta.url);
const { workAsyncStorage } = requireModule("next/dist/server/app-render/work-async-storage.external");
const { workUnitAsyncStorage } = requireModule("next/dist/server/app-render/work-unit-async-storage.external");
const originalLoad = Module._load;
let cms;
try {
  // Next aliases this build-time boundary marker; plain Node does not.
  Module._load = function (id, ...args) {
    return id === "server-only" ? {} : originalLoad.call(this, id, ...args);
  };
  cms = requireModule("../.cache/cms-cache-tests/cms.js");
} finally {
  Module._load = originalLoad;
}

const home = (heading) => ({
  id: 1, title: "Home", meta: { type: "public_content.HomePage", slug: "home" },
  hero_heading: heading, hero_copy: "Published copy",
});

test("CMS cache preserves valid content through ISR and request-time failures", async (t) => {
  const entries = new Map();
  let stale = false;
  let calls = 0;
  let respond = () => Response.json({ items: [home("Original")] });
  const adapter = {
    generateSimpleCacheKey: async (key) => key,
    get: async (key) => entries.has(key) ? { value: entries.get(key), isStale: stale } : null,
    set: async (key, value) => { entries.set(key, value); },
  };
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    calls++;
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return respond();
  });
  t.mock.method(console, "error", () => {}); // Expected Next refresh-error logs.
  const originalUrl = process.env.CMS_API_URL;
  process.env.CMS_API_URL = "http://cms.test";
  t.after(() => {
    if (originalUrl === undefined) delete process.env.CMS_API_URL;
    else process.env.CMS_API_URL = originalUrl;
  });

  async function render(load = cms.getHomePage, isStaticGeneration = true) {
    const store = { incrementalCache: adapter, isStaticGeneration, route: "/", pendingRevalidates: {} };
    const unit = { type: "prerender-legacy", phase: "render", revalidate: Infinity, tags: null };
    const result = await workAsyncStorage.run(store, () => workUnitAsyncStorage.run(unit, load));
    await Promise.all(Object.values(store.pendingRevalidates));
    assert.equal(unit.revalidate, 60);
    return result;
  }

  assert.equal((await render()).heroHeading, "Original");
  assert.equal((await render()).heroHeading, "Original");
  assert.equal(calls, 1, "fresh cache avoids upstream requests");
  stale = true;
  const failures = [
    () => { throw new TypeError("Network unavailable"); },
    () => { throw new DOMException("Timed out", "TimeoutError"); },
    () => new Response("Internal error", { status: 500 }),
    () => new Response("Unavailable", { status: 503 }),
    () => new Response("{", { status: 200 }),
    () => Response.json({ unexpected: true }),
    () => Response.json({ items: [home("")] }),
  ];
  for (const failure of failures) {
    respond = failure;
    assert.equal((await render()).heroHeading, "Original", "ISR retains last valid CMS response");
    assert.equal((await render(cms.getHomePage, false)).heroHeading, "Original", "SSR serves stale CMS response");
  }
  respond = () => Response.json({ items: [home("Recovered")] });
  assert.equal((await render()).heroHeading, "Recovered");
  respond = () => Response.json({ items: [] });
  assert.equal(await render(), null, "valid empty response is authoritative, not an outage");
  respond = failures[0];
  assert.equal(await render(), null, "latest valid empty response supersedes old populated content");
  entries.clear();
  for (const failure of failures) {
    respond = failure;
    assert.equal(await render(), null, "cold-cache failures permit existing page fallbacks");
    assert.equal(entries.size, 0, "failures must not be cached");
  }
  respond = () => Response.json({ items: [] });
  assert.deepEqual(await render(cms.getServicePagesResult), { items: [], apiAvailable: true });
  entries.clear();
  respond = failures[0];
  assert.deepEqual(await render(cms.getServicePagesResult), { items: [], apiAvailable: false });

  entries.clear();
  respond = () => Response.json([{ id: 7, person: "Test editor", quote: "Test quote" }]);
  assert.equal((await render(cms.getTestimonials))[0].quote, "Test quote");
  respond = () => Response.json([{ invalid: true }]);
  assert.equal((await render(cms.getTestimonials))[0].quote, "Test quote");
  respond = () => Response.json([]);
  assert.deepEqual(await render(cms.getTestimonials), []);

  entries.clear();
  stale = false;
  respond = () => Response.json({ items: [home("Origin one")] });
  assert.equal((await render()).heroHeading, "Origin one");
  process.env.CMS_API_URL = "http://other-cms.test";
  respond = failures[0];
  assert.equal(await render(), null, "cache cannot leak across CMS origins");
  process.env.CMS_API_URL = "http://cms.test";
  assert.equal((await render()).heroHeading, "Origin one");

  entries.clear();
  let page = 0;
  respond = () => ++page === 1
    ? Response.json({ items: Array.from({ length: 20 }, (_, id) => ({ ...home("Test"), id })) })
    : new Response("Unavailable", { status: 503 });
  assert.deepEqual(await render(cms.getServicePagesResult), { items: [], apiAvailable: false },
    "a failed later pagination request must not masquerade as a complete collection");

  // Both metadata and the Work route use this lookup before fallback/notFound.
  entries.clear();
  const caseStudy = (slug) => ({
    id: 42, title: "CMS case study",
    meta: { type: "public_content.CaseStudyPage", slug },
  });
  const existing = () => cms.getCaseStudyPage("existing-slug");
  const newPage = () => cms.getCaseStudyPage("new-slug");
  respond = () => Response.json({ items: [caseStudy("existing-slug")] });
  await render(existing);
  stale = true;
  const caseStudyFailures = [
    ...failures.slice(0, -1),
    () => Response.json({ items: [{ title: "Missing required page metadata" }] }),
  ];
  for (const failure of caseStudyFailures) {
    respond = failure;
    assert.equal((await render(existing)).meta.slug, "existing-slug",
      "existing CMS page survives a failed refresh");
    await assert.rejects(render(newPage), /CMS is temporarily unavailable/,
      "uncached new slug must fail the render, not return null to notFound");
  }
  respond = () => Response.json({ items: [caseStudy("new-slug")] });
  assert.equal((await render(newPage)).meta.slug, "new-slug",
    "new slug resolves after recovery without a frontend rebuild");
  entries.clear();
  respond = failures[0];
  await assert.rejects(render(existing), /CMS is temporarily unavailable/,
    "lost cache must not replace an existing page with static fallback");
  respond = () => Response.json({ items: [] });
  assert.equal(await render(newPage), null,
    "successful missing lookup still reaches the route's existing notFound rule");
});
