"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  function signOut() { clearTokens(); router.push("/login"); }
  return <main className="portal"><header className="portal-header"><Link href="/client/dashboard" className="portal-brand">LABIO MEDIA <span>CLIENT PORTAL</span></Link><nav><Link href="/client/dashboard">Dashboard</Link><Link href="/client/projects">Projects</Link><Link href="/client/messages">Messages</Link><button onClick={signOut}>Sign out</button></nav></header>{children}</main>;
}
