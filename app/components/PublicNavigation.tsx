"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CmsNavigationLink, CmsSocialLink } from "@/lib/cms-types";
import BrandName from "./BrandName";
import ThemeControl from "./ThemeControl";

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
  navigationLinks: CmsNavigationLink[];
};

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
  navigationLinks,
}: PublicNavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="LaBio Media home" onClick={closeMenu}>
        <BrandName variant="auto" />
      </Link>

      <button
        type="button"
        className="mobile-nav-toggle"
        aria-controls="public-navigation-panel"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{menuOpen ? "Close" : "Menu"}</span>
        <span className="mobile-nav-icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div
        id="public-navigation-panel"
        className={`public-navigation-panel${menuOpen ? " is-open" : ""}`}
      >
        <nav className="main-nav" aria-label="Primary navigation">
          {navigationLinks.map((link) => {
            const active = !link.external && isActive(pathname, link.href);
            if (link.external) {
              return (
                <a
                  key={link.label + link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.label + link.href}
                href={link.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="account-access-link"
            aria-label="Client login"
            title="Client login"
            onClick={closeMenu}
          >
            <svg
              className="account-access-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" />
            </svg>
            <span className="account-access-label">Client login</span>
          </Link>
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
                  onClick={closeMenu}
                >
                  {service.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <ThemeControl />
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
      </div>
    </aside>
  );
}
