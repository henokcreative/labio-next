import type { Metadata } from "next";
import { Geist, Montserrat } from "next/font/google";
import ConsentManager from "@/app/components/ConsentManager";
import { getPublicThemeInitializationScript } from "@/lib/public-theme";
import { publicSiteUrl } from "@/lib/public-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const montserratBrand = Montserrat({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: "800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl("/")),
  title: "LaBio Media",
  description: "Creative communication for research and science.",
  applicationName: "LaBio Media",
  openGraph: {
    type: "website",
    siteName: "LaBio Media",
    locale: "en_GB",
    title: "LaBio Media",
    description: "Creative communication for research and science.",
    url: publicSiteUrl("/"),
  },
  twitter: {
    card: "summary",
    title: "LaBio Media",
    description: "Creative communication for research and science.",
  },
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
      className={`${geistSans.variable} ${montserratBrand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          id="public-theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getPublicThemeInitializationScript() }}
        />
        {children}
        <ConsentManager />
      </body>
    </html>
  );
}
