"use client";

import { useEffect, useState } from "react";
import {
  PUBLIC_CONSENT_CHANGE_EVENT,
  PUBLIC_CONSENT_OPEN_EVENT,
  PUBLIC_CONSENT_STORAGE_KEY,
  hasPublicConsent,
  readPublicConsent,
} from "@/lib/public-consent";

export default function ConsentAwareEmbed({
  embedUrl,
  sourceUrl,
}: {
  embedUrl: string;
  sourceUrl: string;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function refreshConsent() {
      try {
        setAllowed(hasPublicConsent(
          readPublicConsent(window.localStorage),
          "externalMedia",
        ));
      } catch {
        setAllowed(false);
      }
    }

    const initialFrame = window.requestAnimationFrame(refreshConsent);
    function handleStorage(event: StorageEvent) {
      if (event.key === PUBLIC_CONSENT_STORAGE_KEY) refreshConsent();
    }
    window.addEventListener(PUBLIC_CONSENT_CHANGE_EVENT, refreshConsent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener(PUBLIC_CONSENT_CHANGE_EVENT, refreshConsent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (allowed) {
    return (
      <div className="cms-embed">
        <iframe
          src={embedUrl}
          title="Embedded media"
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="cms-embed-consent">
      <p>External media is available only when you allow that category.</p>
      <div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(PUBLIC_CONSENT_OPEN_EVENT))}
        >
          Review cookie settings
        </button>
        <a href={sourceUrl}>Open media directly</a>
      </div>
    </div>
  );
}
