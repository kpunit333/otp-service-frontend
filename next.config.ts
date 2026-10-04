import type { NextConfig } from "next";

// Execute custom configuration loader for --configuration support
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { loadConfigurationEnv } = require("./scripts/env-loader");
const { loadedEnv } = loadConfigurationEnv();

/**
 * Enterprise Production Next.js Configuration
 * Includes Content Security Policy (CSP), HTTP Security Headers,
 * Image Optimization, Caching, and Backend API Rewrites.
 */

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  env: loadedEnv,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Security and custom HTTP headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Backend API Rewrites to prevent CORS issues
  async rewrites() {
    return [
      {
        source: "/api/auth/o/login",
        destination: `${BACKEND_URL}/api/auth/o/login`,
      },
      {
        source: "/api/auth/o/login/",
        destination: `${BACKEND_URL}/api/auth/o/login`,
      },
      {
        source: "/api/organizations/v1/organization",
        destination: `${BACKEND_URL}/api/organizations/v1/organization`,
      },
      {
        source: "/api/organizations/v1/organization/",
        destination: `${BACKEND_URL}/api/organizations/v1/organization`,
      },
      {
        source: "/api/organizations/:path*",
        destination: `${BACKEND_URL}/api/organizations/:path*`,
      },
      {
        source: "/v1/:path*",
        destination: `${BACKEND_URL}/v1/:path*`,
      },
    ];
  },

  // Logging configuration for production observability
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
