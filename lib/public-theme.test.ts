import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import {
  PUBLIC_THEME_STORAGE_KEY,
  getPublicThemeInitializationScript,
  isPublicThemePath,
  parsePublicThemePreference,
  persistPublicThemePreference,
  readPublicThemePreference,
  resolvePublicTheme,
} from "./public-theme";

function runInitializer({
  pathname = "/",
  storedPreference = null,
  systemPrefersDark = false,
}: {
  pathname?: string;
  storedPreference?: string | null;
  systemPrefersDark?: boolean;
}) {
  const dataset: Record<string, string> = {};
  vm.runInNewContext(getPublicThemeInitializationScript(), {
    document: { documentElement: { dataset } },
    localStorage: { getItem: () => storedPreference },
    window: {
      location: { pathname },
      matchMedia: () => ({ matches: systemPrefersDark }),
    },
  });
  return dataset;
}

test("defaults missing and invalid preferences to system", () => {
  assert.equal(parsePublicThemePreference(null), "system");
  assert.equal(parsePublicThemePreference("sepia"), "system");
  assert.equal(parsePublicThemePreference("dark"), "dark");
});

test("system follows the operating-system preference", () => {
  assert.equal(resolvePublicTheme("system", false), "light");
  assert.equal(resolvePublicTheme("system", true), "dark");
});

test("explicit preferences override the operating-system preference", () => {
  assert.equal(resolvePublicTheme("light", true), "light");
  assert.equal(resolvePublicTheme("dark", false), "dark");
});

test("preferences use the stable local-storage key", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };

  persistPublicThemePreference(storage, "dark");

  assert.equal(values.get(PUBLIC_THEME_STORAGE_KEY), "dark");
  assert.equal(readPublicThemePreference(storage), "dark");
});

test("private and authentication routes remain outside the public theme", () => {
  for (const pathname of [
    "/client/dashboard",
    "/staff/messages",
    "/login",
    "/invite/example",
    "/accept-invitation",
  ]) {
    assert.equal(isPublicThemePath(pathname), false, pathname);
  }

  for (const pathname of ["/", "/work", "/services/web-digital", "/client-stories"]) {
    assert.equal(isPublicThemePath(pathname), true, pathname);
  }
});

test("the pre-paint initializer resolves system and explicit preferences", () => {
  assert.deepEqual(
    runInitializer({ systemPrefersDark: true }),
    { publicThemePreference: "system", publicTheme: "dark" },
  );
  assert.deepEqual(
    runInitializer({ storedPreference: "light", systemPrefersDark: true }),
    { publicThemePreference: "light", publicTheme: "light" },
  );
  assert.deepEqual(
    runInitializer({ storedPreference: "invalid", systemPrefersDark: false }),
    { publicThemePreference: "system", publicTheme: "light" },
  );
});

test("the pre-paint initializer does not mark private routes", () => {
  assert.deepEqual(
    runInitializer({ pathname: "/client/dashboard", storedPreference: "dark" }),
    {},
  );
});
