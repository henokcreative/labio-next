import Link from "next/link";
import type { CmsSiteSettings } from "@/lib/cms-types";
import BrandName from "./BrandName";

export default function PublicFooter({
  settings,
}: {
  settings: CmsSiteSettings | null;
}) {
  return (
    <footer className="footer">
      <span className="footer-brand">
        <BrandName variant="auto" />
        <span>{new Date().getFullYear()}</span>
      </span>
      <div className="footer-links">
        <Link href="/privacy">Privacy</Link>
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
