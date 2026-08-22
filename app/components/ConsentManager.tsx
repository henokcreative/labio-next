"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  PUBLIC_CONSENT_CHANGE_EVENT,
  PUBLIC_CONSENT_OPEN_EVENT,
  PUBLIC_CONSENT_STORAGE_KEY,
  type PublicConsent,
  acceptAllPublicConsent,
  createPublicConsent,
  getPublicConsentView,
  persistPublicConsent,
  readPublicConsent,
  rejectNonEssentialPublicConsent,
} from "@/lib/public-consent";
import { isPublicThemePath } from "@/lib/public-theme";

type ConsentState = PublicConsent | null | undefined;

export default function ConsentManager() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>(undefined);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState(rejectNonEssentialPublicConsent());
  const consentRef = useRef<PublicConsent | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isPublicPath = isPublicThemePath(pathname);

  useEffect(() => {
    let storedConsent: PublicConsent | null = null;
    try {
      storedConsent = readPublicConsent(window.localStorage);
    } catch {
      // Consent remains available for the current page if storage is blocked.
    }
    const initialFrame = window.requestAnimationFrame(() => {
      consentRef.current = storedConsent;
      setConsent(storedConsent);
    });

    function handleStorage(event: StorageEvent) {
      if (event.key !== PUBLIC_CONSENT_STORAGE_KEY) return;
      try {
        const stored = readPublicConsent(window.localStorage);
        consentRef.current = stored;
        setConsent(stored);
      } catch {
        consentRef.current = null;
        setConsent(null);
      }
    }

    function handleOpenPreferences() {
      let currentConsent = consentRef.current;
      try {
        currentConsent = readPublicConsent(window.localStorage);
      } catch {
        // Use the current in-memory choice when storage is unavailable.
      }
      setDraft(currentConsent ?? rejectNonEssentialPublicConsent());
      setPreferencesOpen(true);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PUBLIC_CONSENT_OPEN_EVENT, handleOpenPreferences);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PUBLIC_CONSENT_OPEN_EVENT, handleOpenPreferences);
    };
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPreferencesOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preferencesOpen]);

  function commit(nextConsent: PublicConsent) {
    consentRef.current = nextConsent;
    setConsent(nextConsent);
    setDraft(nextConsent);
    setPreferencesOpen(false);
    try {
      persistPublicConsent(window.localStorage, nextConsent);
    } catch {
      // The choice still applies for the current page when storage is unavailable.
    }
    window.dispatchEvent(
      new CustomEvent(PUBLIC_CONSENT_CHANGE_EVENT, { detail: nextConsent }),
    );
  }

  function openPreferences() {
    setDraft(consent ?? rejectNonEssentialPublicConsent());
    setPreferencesOpen(true);
  }

  if (!isPublicPath || consent === undefined) return null;
  const view = getPublicConsentView(consent, preferencesOpen);

  return (
    <div className="consent-layer">
      {view === "banner" && (
        <section
          className="consent-banner"
          aria-label="Cookie and privacy choices"
        >
          <div>
            <p className="consent-eyebrow">Privacy choices</p>
            <h2>Choose how this site may use optional services.</h2>
            <p>
              Essential storage keeps the site and client portal working.
              Analytics, marketing and external media remain off unless you
              allow them. <Link href="/cookies">Read the cookie policy</Link>.
            </p>
          </div>
          <div className="consent-banner-actions">
            <button
              type="button"
              className="consent-action consent-action-primary"
              onClick={() => commit(acceptAllPublicConsent())}
            >
              Accept all
            </button>
            <button
              type="button"
              className="consent-action"
              onClick={() => commit(rejectNonEssentialPublicConsent())}
            >
              Reject non-essential
            </button>
            <button
              type="button"
              className="consent-manage"
              onClick={openPreferences}
            >
              Manage preferences
            </button>
          </div>
        </section>
      )}

      {view === "preferences" && (
        <div className="consent-modal-backdrop">
          <div
            ref={dialogRef}
            className="consent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-preferences-title"
            tabIndex={-1}
          >
            <p className="consent-eyebrow">Privacy choices</p>
            <h2 id="consent-preferences-title">Cookie settings</h2>
            <p className="consent-modal-intro">
              Optional categories are off until you choose otherwise. You can
              return here at any time from the footer.
            </p>
            <div className="consent-options">
              <label>
                <span>
                  <strong>Essential</strong>
                  <small>Required for preferences, security and portal access.</small>
                </span>
                <input type="checkbox" checked disabled />
              </label>
              <label>
                <span>
                  <strong>Analytics</strong>
                  <small>Optional audience measurement. Not currently in use.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(event) => setDraft(createPublicConsent({
                    ...draft,
                    analytics: event.target.checked,
                  }))}
                />
              </label>
              <label>
                <span>
                  <strong>Marketing</strong>
                  <small>Optional advertising services. Not currently in use.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(event) => setDraft(createPublicConsent({
                    ...draft,
                    marketing: event.target.checked,
                  }))}
                />
              </label>
              <label>
                <span>
                  <strong>External media</strong>
                  <small>Allows embedded video from third-party providers.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.externalMedia}
                  onChange={(event) => setDraft(createPublicConsent({
                    ...draft,
                    externalMedia: event.target.checked,
                  }))}
                />
              </label>
            </div>
            <div className="consent-modal-actions">
              <button
                type="button"
                className="consent-action consent-action-primary"
                onClick={() => commit(draft)}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="consent-manage"
                onClick={() => setPreferencesOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
