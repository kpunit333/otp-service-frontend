import { NextRequest, NextResponse } from "next/server";
import { ApiKeyItem } from "@/types/otp";
import { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

let keys: ApiKeyItem[] = [
  {
    id: "key_prod_01",
    name: "Production Auth Service",
    prefix: "otpsh_live_",
    maskedKey: "otpsh_live_8f3a••••••••••••••e902",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    rateLimitPerMinute: 600,
    status: "active",
  },
  {
    id: "key_staging_02",
    name: "Staging Testing Worker",
    prefix: "otpsh_test_",
    maskedKey: "otpsh_test_7a1b••••••••••••••b431",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    rateLimitPerMinute: 120,
    status: "active",
  },
];

export async function GET() {
  const response: ApiResponse<ApiKeyItem[]> = {
    success: true,
    data: keys,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      version: "v1",
    },
  };
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || "Default API Key";
    const environment = body.env === "production" ? "live" : "test";
    const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fullKey = `otpsh_${environment}_${randomSecret}`;
    const maskedKey = `otpsh_${environment}_${randomSecret.slice(0, 4)}••••••••••••••${randomSecret.slice(-4)}`;

    const newKeyItem: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      prefix: `otpsh_${environment}_`,
      maskedKey,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      rateLimitPerMinute: environment === "live" ? 600 : 120,
      status: "active",
    };

    keys.unshift(newKeyItem);

    return NextResponse.json({
      success: true,
      data: {
        ...newKeyItem,
        rawKey: fullKey, // Only revealed once upon creation
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "KEY_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to create API key.",
        },
      },
      { status: 500 }
    );
  }
}
