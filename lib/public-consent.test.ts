import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_CONSENT_STORAGE_KEY,
  acceptAllPublicConsent,
  createPublicConsent,
  getPublicConsentView,
  hasPublicConsent,
  parsePublicConsent,
  persistPublicConsent,
  readPublicConsent,
  rejectNonEssentialPublicConsent,
} from "./public-consent";

test("missing or malformed consent remains an undecided first visit", () => {
  assert.equal(parsePublicConsent(null), null);
  assert.equal(parsePublicConsent("not-json"), null);
  assert.equal(parsePublicConsent('{"version":1,"analytics":true}'), null);
  assert.equal(parsePublicConsent('{"version":2,"analytics":false,"marketing":false,"externalMedia":false}'), null);
  assert.equal(getPublicConsentView(null, false), "banner");
  assert.equal(getPublicConsentView(undefined, false), "hidden");
});

test("accept all enables every optional category", () => {
  assert.deepEqual(acceptAllPublicConsent(), {
    version: 1,
    essential: true,
    analytics: true,
    marketing: true,
    externalMedia: true,
  });
});

test("reject non-essential keeps essential storage active", () => {
  const consent = rejectNonEssentialPublicConsent();
  assert.equal(hasPublicConsent(consent, "essential"), true);
  assert.equal(hasPublicConsent(consent, "analytics"), false);
  assert.equal(hasPublicConsent(consent, "marketing"), false);
  assert.equal(hasPublicConsent(consent, "externalMedia"), false);
  assert.equal(hasPublicConsent(null, "essential"), true);
  assert.equal(hasPublicConsent(null, "externalMedia"), false);
});

test("managed preferences round-trip through the stable storage key", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
  const managed = createPublicConsent({
    analytics: true,
    marketing: false,
    externalMedia: true,
  });

  persistPublicConsent(storage, managed);

  assert.equal(values.has(PUBLIC_CONSENT_STORAGE_KEY), true);
  assert.deepEqual(readPublicConsent(storage), managed);
  assert.equal(getPublicConsentView(readPublicConsent(storage), true), "preferences");

  const changed = createPublicConsent({
    ...managed,
    analytics: false,
  });
  persistPublicConsent(storage, changed);
  assert.deepEqual(readPublicConsent(storage), changed);
  assert.equal(getPublicConsentView(readPublicConsent(storage), false), "hidden");
});

test("essential consent cannot be disabled by stored input", () => {
  const parsed = parsePublicConsent(
    '{"version":1,"essential":false,"analytics":false,"marketing":false,"externalMedia":false}',
  );
  assert.equal(parsed?.essential, true);
});
