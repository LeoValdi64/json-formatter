import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSON Formatter & Validator",
  url: "https://json-formatter-leovaldi64.vercel.app",
  description:
    "Free online JSON formatter, validator, and beautifier. Format, minify, and validate JSON data with syntax highlighting.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires a modern web browser",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://json-formatter-leovaldi64.vercel.app"),
  title: "JSON Formatter & Validator - Free Online Tool",
  description:
    "Free online JSON formatter, validator, and beautifier. Format, minify, and validate JSON data with syntax highlighting.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json minifier",
    "json tool",
    "developer tool",
  ],
  authors: [{ name: "JSON Formatter" }],
  alternates: {
    canonical: "https://json-formatter-leovaldi64.vercel.app",
  },
  openGraph: {
    title: "JSON Formatter & Validator - Free Online Tool",
    description:
      "Free online JSON formatter, validator, and beautifier. Format, minify, and validate JSON data with syntax highlighting.",
    url: "https://json-formatter-leovaldi64.vercel.app",
    siteName: "JSON Formatter",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JSON Formatter and Validator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter & Validator - Free Online Tool",
    description:
      "Free online JSON formatter, validator, and beautifier with syntax highlighting.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
