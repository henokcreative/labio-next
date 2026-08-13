import type { ReactNode } from "react";
import { fallbackServices } from "@/data/public-fallbacks";
import { getServicePages, getSiteSettings } from "@/lib/cms";
import PublicNavigation from "./PublicNavigation";

export default async function PublicShell({ children }: { children: ReactNode }) {
  const [cmsServices, settings] = await Promise.all([
    getServicePages(),
    getSiteSettings(),
  ]);
  const sourceServices = cmsServices.length > 0 ? cmsServices : fallbackServices;
  const services = sourceServices.map((service) => ({
    id: service.id,
    title: service.title,
    slug: service.meta.slug,
  }));

  return (
    <div className="site-shell">
      <PublicNavigation
        services={services}
        socialLinks={settings ? settings.socialLinks : []}
        address={settings ? settings.address : ""}
        contactEmail={settings ? settings.publicContactEmail : ""}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
