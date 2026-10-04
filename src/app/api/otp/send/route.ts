import { NextRequest, NextResponse } from "next/server";
import { otpEngine } from "@/lib/otp-store";
import { OtpRequestPayload } from "@/types/otp";
import { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OtpRequestPayload>;

    if (!body.recipient || typeof body.recipient !== "string" || body.recipient.trim().length === 0) {
      const errResponse: ApiResponse = {
        success: false,
        error: {
          code: "INVALID_RECIPIENT",
          message: "Recipient phone number or email address is required.",
        },
      };
      return NextResponse.json(errResponse, { status: 400 });
    }

    const channel = body.channel || (body.recipient.includes("@") ? "email" : "sms");
    const length = body.length && body.length >= 4 && body.length <= 8 ? body.length : 6;
    const expirySeconds = body.expirySeconds && body.expirySeconds >= 60 ? body.expirySeconds : 300;

    const result = await otpEngine.sendOtp({
      recipient: body.recipient.trim(),
      channel,
      length,
      expirySeconds,
      metadata: body.metadata,
      templateId: body.templateId,
    });

    const successResponse: ApiResponse = {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: result.requestId,
        version: "v1",
      },
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/otp/send Error:", error);
    const errResponse: ApiResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Internal server error occurred.",
      },
    };
    return NextResponse.json(errResponse, { status: 500 });
  }
}
