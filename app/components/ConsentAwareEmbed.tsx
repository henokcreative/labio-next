"use client";

import { useEffect, useState } from "react";
import {
  PUBLIC_CONSENT_CHANGE_EVENT,
  PUBLIC_CONSENT_OPEN_EVENT,
  PUBLIC_CONSENT_STORAGE_KEY,
  hasPublicConsent,
  readPublicConsent,
} from "@/lib/public-consent";
import BrandName from "./BrandName";

export default function ConsentAwareEmbed({
  embedUrl,
  sourceUrl,
  presentation = "default",
}: {
  embedUrl: string;
  sourceUrl: string;
  presentation?: "default" | "showcase";
}) {
  const [allowed, setAllowed] = useState(false);
  const [activated, setActivated] = useState(false);

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

  if (allowed && (presentation === "default" || activated)) {
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

  if (presentation === "showcase") {
    return (
      <div className="cms-embed showcase-video-poster">
        <div className="showcase-video-poster-content">
          <BrandName variant="light" className="showcase-video-brand" />
          <button
            type="button"
            className="showcase-video-play"
            onClick={() => {
              if (allowed) {
                setActivated(true);
                return;
              }
              window.dispatchEvent(new Event(PUBLIC_CONSENT_OPEN_EVENT));
            }}
            aria-label={allowed ? "Play video" : "Review cookie settings to play video"}
          >
            <span aria-hidden="true">▶</span>
          </button>
          <p>{allowed ? "Play video" : "External media consent required"}</p>
          {!allowed && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Open media directly
            </a>
          )}
        </div>
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
