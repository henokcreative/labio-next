import type { ReactNode } from "react";
import { fallbackServices } from "@/data/public-fallbacks";
import { getServicePagesResult, getSiteSettings } from "@/lib/cms";
import { resolveCmsCollection } from "@/lib/public-content";
import { resolvePublicNavigation } from "@/lib/public-navigation";
import PublicNavigation from "./PublicNavigation";

export default async function PublicShell({ children }: { children: ReactNode }) {
  const [serviceResult, settings] = await Promise.all([
    getServicePagesResult(),
    getSiteSettings(),
  ]);
  const sourceServices = resolveCmsCollection(serviceResult, fallbackServices);
  const services = sourceServices.map((service) => ({
    id: service.id,
    title: service.title,
    slug: service.meta.slug,
  }));

  return (
    <div className="site-shell">
      <a className="skip-link" href="#public-content">Skip to content</a>
      <PublicNavigation
        services={services}
        socialLinks={settings ? settings.socialLinks : []}
        address={settings ? settings.address : ""}
        contactEmail={settings ? settings.publicContactEmail : ""}
        navigationLinks={resolvePublicNavigation(settings?.navigationLinks)}
      />
      <main className="main-content" id="public-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
