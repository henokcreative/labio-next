"use client";

import { PUBLIC_CONSENT_OPEN_EVENT } from "@/lib/public-consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="footer-cookie-settings"
      onClick={() => window.dispatchEvent(new Event(PUBLIC_CONSENT_OPEN_EVENT))}
    >
      Cookie settings
    </button>
  );
}
