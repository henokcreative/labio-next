"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";
import BrandName from "./BrandName";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function signOut() {
    clearTokens();
    router.push("/login");
  }

  return (
    <main className="portal">
      <header className="portal-header">
        <Link href="/client/dashboard" className="portal-brand">
          <BrandName />
          <span className="portal-brand-label">Client portal</span>
        </Link>
        <nav>
          <Link href="/client/dashboard">Dashboard</Link>
          <Link href="/client/projects">Projects</Link>
          <Link href="/client/messages">Messages</Link>
          <button onClick={signOut}>Sign out</button>
        </nav>
      </header>
      {children}
    </main>
  );
}
