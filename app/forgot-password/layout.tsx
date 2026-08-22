import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset password | LaBio Media",
  robots: { index: false, follow: false, nocache: true },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
