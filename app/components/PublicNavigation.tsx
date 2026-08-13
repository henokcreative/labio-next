"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CmsSocialLink } from "@/lib/cms-types";
import BrandName from "./BrandName";

export type PublicNavigationService = {
  id: number;
  title: string;
  slug: string;
};

type PublicNavigationProps = {
  services: PublicNavigationService[];
  socialLinks: CmsSocialLink[];
  address: string;
  contactEmail: string;
};

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
  { label: "Pricing", href: "/pricing" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const path = href.split("#")[0];
  return path !== "/" && pathname.startsWith(path);
}

export default function PublicNavigation({
  services,
  socialLinks,
  address,
  contactEmail,
}: PublicNavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="LaBio Media home">
        <BrandName />
      </Link>

      <nav className="main-nav" aria-label="Primary navigation">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(pathname, link.href) ? "active" : undefined}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-title">WHAT WE DO</div>
        <nav className="service-nav" aria-label="Services">
          {services.map((service) => {
            const serviceHref = "/services/" + service.slug;
            const active = pathname === serviceHref;
            return (
              <Link
                key={service.id}
                href={serviceHref}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {service.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {(socialLinks.length > 0 || contactEmail) && (
          <div className="social-links">
            {socialLinks.map((link) => (
              <a key={link.label + link.url} href={link.url}>
                {link.label}
              </a>
            ))}
            {contactEmail && (
              <a href={"mailto:" + contactEmail} aria-label="Email LaBio Media">
                Email
              </a>
            )}
          </div>
        )}
        <div className="location">
          <div>LaBio Media</div>
          <div>{address || "Turku, Finland"}</div>
        </div>
      </div>
    </aside>
  );
}
