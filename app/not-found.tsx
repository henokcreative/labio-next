import Link from "next/link";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import { getSiteSettings } from "@/lib/cms";

export default async function NotFound() {
  const settings = await getSiteSettings();

  return (
    <PublicShell>
      <section className="not-found-page" aria-labelledby="not-found-heading">
        <div className="eyebrow">404 <span /></div>
        <h1 id="not-found-heading">This page could not be found.</h1>
        <p>
          The address may have changed, or the page may no longer be available.
        </p>
        <Link href="/" className="button button-dark">Return home</Link>
      </section>
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
