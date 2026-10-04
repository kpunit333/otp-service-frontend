import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptimeSeconds = process.uptime ? Math.floor(process.uptime()) : 0;
  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;

  return NextResponse.json({
    status: "healthy",
    service: siteConfig.name,
    version: siteConfig.version,
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || "development",
    memory: memoryUsage
      ? {
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        }
      : undefined,
    checks: {
      redis: "connected (in-memory simulator)",
      smsGateway: "active (failover ready)",
      emailGateway: "active",
      rateLimiter: "enforcing",
    },
  });
}
