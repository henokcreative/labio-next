import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Choose a new password | LaBio Media",
  robots: { index: false, follow: false, nocache: true },
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
