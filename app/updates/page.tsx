import type { Metadata } from "next";
import PublicFooter from "@/app/components/PublicFooter";
import PublicShell from "@/app/components/PublicShell";
import UpdatesIndex from "@/app/components/UpdatesIndex";
import { getSiteSettings, getUpdatesIndexPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getUpdatesIndexPage(),
    getSiteSettings(),
  ]);
  return {
    ...pageMetadata(
      page,
      "Updates — LaBio Media",
      "Occasional notes, insights, milestones and events from LaBio Media.",
      settings,
    ),
    alternates: { canonical: "/updates" },
  };
}

export default async function UpdatesPage() {
  const [page, settings] = await Promise.all([
    getUpdatesIndexPage(),
    getSiteSettings(),
  ]);

  return (
    <PublicShell>
      <header className="public-page-header updates-page-header">
        <div className="eyebrow">From LaBio <span /></div>
        <h1>{page?.title || "Updates"}</h1>
        <p className="public-page-lead">
          {page?.meta.searchDescription
            || "Occasional notes, ideas, milestones and events from LaBio Media."}
        </p>
      </header>
      <UpdatesIndex page={page} />
      <PublicFooter settings={settings} />
    </PublicShell>
  );
}
