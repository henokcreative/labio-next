"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";

export default function StaffShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function signOut() {
    clearTokens();
    router.push("/login");
  }

  return (
    <main className="portal staff-portal">
      <header className="portal-header">
        <Link href="/staff/messages" className="portal-brand">
          LABIO MEDIA <span>STAFF PORTAL</span>
        </Link>
        <nav>
          <Link href="/staff/messages">Messages</Link>
          <button onClick={signOut}>Sign out</button>
        </nav>
      </header>
      {children}
    </main>
  );
}
