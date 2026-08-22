import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/public-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/client/",
        "/staff/",
        "/login",
        "/invite",
        "/accept-invitation",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: publicSiteUrl("/sitemap.xml"),
    host: publicSiteUrl("/"),
  };
}
