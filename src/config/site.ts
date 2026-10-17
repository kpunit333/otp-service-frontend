/**
 * Global Site Configuration & Metadata
 */

import { env } from "@/environment/env";

export const siteConfig = {
  name: env.appName,
  shortName: "OrionSecurity",
  description: env.appDescription,
  url: env.appUrl,
  ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop",
  links: {
    github: "https://github.com/kpunit333/otp-service-frontend",
    docs: "/dashboard/docs",
    support: "mailto:support@orionsecurity.io",
  },
  author: "Orion Security Engineering Team",
  version: "1.0.0",
};
