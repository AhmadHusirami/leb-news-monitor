import type { Metadata, Viewport } from "next";
import { Poppins, Tajawal } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a12" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lebmonitor.com"),
  title: {
    default:
      "LEB Monitor — Live Lebanon-Israel Conflict News Feed | Real-Time Updates",
    template: "%s | LEB Monitor",
  },
  description:
    "Real-time multi-source news monitor aggregating 47+ RSS feeds covering the Lebanon-Israel conflict, humanitarian updates, UNIFIL reports, ceasefire developments, and Middle East breaking news. Updated every minute.",
  keywords: [
    "Lebanon news",
    "Israel news",
    "Lebanon Israel conflict",
    "Middle East news live",
    "conflict monitor",
    "RSS news aggregator",
    "breaking news Middle East",
    "humanitarian crisis Lebanon",
    "ceasefire updates",
    "UNIFIL reports",
    "realtime news feed",
    "Lebanon war updates",
    "Hezbollah news",
    "IDF operations",
    "Beirut news",
    "South Lebanon",
  ],
  authors: [{ name: "LEB Monitor" }],
  creator: "LEB Monitor",
  publisher: "LEB Monitor",
  category: "News",
  openGraph: {
    title: "LEB Monitor — Live Lebanon-Israel Conflict News Feed",
    description:
      "Real-time multi-source news monitor aggregating 47+ RSS feeds covering the Lebanon-Israel conflict, humanitarian updates, and Middle East breaking news.",
    type: "website",
    locale: "en_US",
    siteName: "LEB Monitor",
    url: "https://lebmonitor.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LEB Monitor — Live Lebanon-Israel Conflict News Feed",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEB Monitor — Live Lebanon-Israel Conflict News Feed",
    description:
      "Real-time multi-source news monitor aggregating 47+ RSS feeds for the Lebanon-Israel conflict.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://lebmonitor.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LEB Monitor",
  alternateName: "Lebanon-Israel Conflict Monitor",
  url: "https://lebmonitor.com",
  description:
    "Real-time multi-source news monitor aggregating 47+ RSS feeds covering the Lebanon-Israel conflict, humanitarian updates, and Middle East breaking news.",
  applicationCategory: "NewsApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "LEB Monitor",
    url: "https://lebmonitor.com",
  },
  about: {
    "@type": "Event",
    name: "Lebanon-Israel Conflict",
    location: {
      "@type": "Place",
      name: "Lebanon and Israel",
      geo: {
        "@type": "GeoShape",
        box: "33.05 35.1 34.7 36.6",
      },
    },
  },
};

const newsMediaJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LEB Monitor",
  url: "https://lebmonitor.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://lebmonitor.com?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('lebmon-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsMediaJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} ${tajawal.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-R2L7NG8ET3" />
      </body>
    </html>
  );
}
