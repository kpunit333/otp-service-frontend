/**
 * Global Site Configuration & Metadata
 */

export const siteConfig = {
  name: "Orion Security",
  shortName: "OrionSecurity",
  description:
    "Ultra-reliable, high-throughput OTP verification platform with multi-channel routing (SMS, WhatsApp, Email) and instant failover.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop",
  links: {
    github: "https://github.com/kpunit333/otp-service-frontend",
    docs: "/dashboard/docs",
    support: "mailto:support@orionsecurity.io",
  },
  author: "Orion Security Engineering Team",
  version: "1.0.0",
};
