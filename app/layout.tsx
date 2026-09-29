import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import ConsentManager from "@/app/components/ConsentManager";
import { getPublicThemeInitializationScript } from "@/lib/public-theme";
import { publicSiteUrl } from "@/lib/public-url";
import "./globals.css";
// Stable stylesheet order also preserves the shared Updates showcase on navigation.
import "./work/[slug]/case-study.css";
import "./components/CaseStudyShowcase.css";
import { Analytics } from "@vercel/analytics/next";

const futura = localFont({
  src: [
    { path: "./fonts/FuturaLT.woff2", weight: "400", style: "normal" },
    // Both upright faces report 400; prefer Book for normal site text.
    { path: "./fonts/FuturaLT-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FuturaLT-Heavy.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-futura",
  display: "swap",
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
      className={`${futura.variable} ${montserratBrand.variable} h-full antialiased`}
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
