import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserratBrand = Montserrat({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: "800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://labiomedia.com",
  ),
  title: { default: "LaBio Media", template: "%s | LaBio Media" },
  description: "Creative communication for research and science.",
  applicationName: "LaBio Media",
  icons: {
    icon: [
      { url: "/brand/logo.svg", type: "image/svg+xml" },
      { url: "/brand/logo192.png", type: "image/png", sizes: "193x258" },
      { url: "/brand/logo512.png", type: "image/png", sizes: "193x257" },
    ],
    apple: {
      url: "/brand/logo192.png",
      type: "image/png",
      sizes: "193x258",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserratBrand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
