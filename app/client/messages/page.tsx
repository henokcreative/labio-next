"use client";

import MessagingInbox from "@/app/components/MessagingInbox";
import PortalShell from "@/app/components/PortalShell";

export default function ClientMessagesPage() {
  return <PortalShell><MessagingInbox staff={false} /></PortalShell>;
}
