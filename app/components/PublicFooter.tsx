import Link from "next/link";
import type { CmsSiteSettings } from "@/lib/cms-types";

export default function PublicFooter({
  settings,
}: {
  settings: CmsSiteSettings | null;
}) {
  return (
    <footer className="footer">
      <span>LaBio Media {new Date().getFullYear()}</span>
      <div className="footer-links">
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/terms">Terms</Link>
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
