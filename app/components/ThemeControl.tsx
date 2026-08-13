"use client";

import { useEffect, useState } from "react";
import {
  PUBLIC_THEME_STORAGE_KEY,
  PUBLIC_THEME_PREFERENCES,
  type PublicThemePreference,
  parsePublicThemePreference,
  persistPublicThemePreference,
  readPublicThemePreference,
  resolvePublicTheme,
} from "@/lib/public-theme";

const themeLabels: Record<PublicThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

function applyPublicTheme(
  preference: PublicThemePreference,
  mediaQuery: MediaQueryList,
): void {
  const root = document.documentElement;
  root.dataset.publicThemePreference = preference;
  root.dataset.publicTheme = resolvePublicTheme(preference, mediaQuery.matches);
}

export default function ThemeControl() {
  const [preference, setPreference] = useState<PublicThemePreference>("system");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let storedPreference: PublicThemePreference = "system";

    try {
      storedPreference = readPublicThemePreference(window.localStorage);
    } catch {
      storedPreference = parsePublicThemePreference(
        document.documentElement.dataset.publicThemePreference,
      );
    }

    applyPublicTheme(storedPreference, mediaQuery);
    const initialStateFrame = window.requestAnimationFrame(() => {
      setPreference(storedPreference);
    });

    function handleSystemThemeChange() {
      const currentPreference = parsePublicThemePreference(
        document.documentElement.dataset.publicThemePreference,
      );
      if (currentPreference === "system") {
        applyPublicTheme(currentPreference, mediaQuery);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== PUBLIC_THEME_STORAGE_KEY) return;
      const nextPreference = parsePublicThemePreference(event.newValue);
      setPreference(nextPreference);
      applyPublicTheme(nextPreference, mediaQuery);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.cancelAnimationFrame(initialStateFrame);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function selectTheme(nextPreference: PublicThemePreference) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setPreference(nextPreference);
    applyPublicTheme(nextPreference, mediaQuery);

    try {
      persistPublicThemePreference(window.localStorage, nextPreference);
    } catch {
      // The selected theme still applies for this page when storage is unavailable.
    }
  }

  return (
    <div className="theme-control">
      <span className="theme-control-label" id="public-theme-label">Theme</span>
      <div className="theme-options" role="group" aria-labelledby="public-theme-label">
        {PUBLIC_THEME_PREFERENCES.map((option) => (
          <button
            key={option}
            type="button"
            className="theme-option"
            data-theme-value={option}
            aria-label={`Use ${option} theme`}
            aria-pressed={preference === option}
            onClick={() => selectTheme(option)}
          >
            {themeLabels[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
