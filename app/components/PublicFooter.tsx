import Link from "next/link";
import { resolveBusinessIdentity } from "@/lib/business-identity";
import type { CmsSiteSettings } from "@/lib/cms-types";
import BrandName from "./BrandName";
import CookieSettingsButton from "./CookieSettingsButton";

export default function PublicFooter({
  settings,
}: {
  settings: CmsSiteSettings | null;
}) {
  const identity = resolveBusinessIdentity(settings);

  return (
    <footer className="footer">
      <div className="footer-company">
        <span className="footer-brand">
          <BrandName variant="auto" />
          <span>{new Date().getFullYear()}</span>
        </span>
        {identity.footerLine && (
          <p className="footer-business-identity">{identity.footerLine}</p>
        )}
      </div>
      <div className="footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookies">Cookies</Link>
        <CookieSettingsButton />
      </div>
      {settings && settings.socialLinks.length > 0 && (
        <div className="footer-social">
          {settings.socialLinks.map((link) => (
            <a key={link.label + link.url} href={link.url}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
