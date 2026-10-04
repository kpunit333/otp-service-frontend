import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Enterprise Multi-Channel OTP Delivery Engine`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "OTP service",
    "SMS OTP",
    "WhatsApp OTP",
    "Email OTP",
    "Two-Factor Authentication",
    "2FA verification",
    "Next.js OTP",
    "Twilio",
    "SendGrid",
  ],
  authors: [{ name: siteConfig.author }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
