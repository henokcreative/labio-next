"use client";

import MessagingInbox from "@/app/components/MessagingInbox";
import StaffShell from "@/app/components/StaffShell";

export default function StaffMessagesPage() {
  return <StaffShell><MessagingInbox staff /></StaffShell>;
}
