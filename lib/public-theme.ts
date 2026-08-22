export const PUBLIC_THEME_STORAGE_KEY = "labio-public-theme";

export const PUBLIC_THEME_PREFERENCES = ["system", "light", "dark"] as const;

export const PUBLIC_THEME_ISOLATED_ROUTES = [
  "/client",
  "/staff",
  "/login",
  "/invite",
  "/accept-invitation",
  "/forgot-password",
  "/reset-password",
] as const;

export type PublicThemePreference = (typeof PUBLIC_THEME_PREFERENCES)[number];
export type ResolvedPublicTheme = Exclude<PublicThemePreference, "system">;

type ReadableThemeStorage = {
  getItem(key: string): string | null;
};

type WritableThemeStorage = {
  setItem(key: string, value: string): void;
};

export function parsePublicThemePreference(
  value: string | null | undefined,
): PublicThemePreference {
  return PUBLIC_THEME_PREFERENCES.includes(value as PublicThemePreference)
    ? (value as PublicThemePreference)
    : "system";
}

export function resolvePublicTheme(
  preference: PublicThemePreference,
  systemPrefersDark: boolean,
): ResolvedPublicTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function readPublicThemePreference(
  storage: ReadableThemeStorage,
): PublicThemePreference {
  return parsePublicThemePreference(storage.getItem(PUBLIC_THEME_STORAGE_KEY));
}

export function persistPublicThemePreference(
  storage: WritableThemeStorage,
  preference: PublicThemePreference,
): void {
  storage.setItem(PUBLIC_THEME_STORAGE_KEY, preference);
}

function pathMatchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + "/");
}

export function isPublicThemePath(pathname: string): boolean {
  return !PUBLIC_THEME_ISOLATED_ROUTES.some((route) =>
    pathMatchesRoute(pathname, route),
  );
}

export function getPublicThemeInitializationScript(): string {
  const storageKey = JSON.stringify(PUBLIC_THEME_STORAGE_KEY);
  const isolatedRoutes = JSON.stringify(PUBLIC_THEME_ISOLATED_ROUTES);

  return `(function(){var path=window.location.pathname;var isolated=${isolatedRoutes}.some(function(route){return path===route||path.indexOf(route+'/')===0;});if(isolated)return;try{var key=${storageKey};var stored=localStorage.getItem(key);var preference=stored==='light'||stored==='dark'||stored==='system'?stored:'system';var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=preference==='system'?(prefersDark?'dark':'light'):preference;document.documentElement.dataset.publicThemePreference=preference;document.documentElement.dataset.publicTheme=resolved;}catch(error){var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.publicThemePreference='system';document.documentElement.dataset.publicTheme=prefersDark?'dark':'light';}})();`;
}
