import { NextRequest, NextResponse } from "next/server";
import { otpEngine } from "@/lib/otp-store";
import { OtpVerifyPayload } from "@/types/otp";
import { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OtpVerifyPayload>;

    if (!body.recipient || !body.code) {
      const errResponse: ApiResponse = {
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Both recipient and verification code are required.",
        },
      };
      return NextResponse.json(errResponse, { status: 400 });
    }

    const result = await otpEngine.verifyOtp({
      recipient: body.recipient.trim(),
      code: body.code.trim(),
      requestId: body.requestId,
    });

    const responsePayload: ApiResponse = {
      success: result.success,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: result.requestId,
        version: "v1",
      },
    };

    return NextResponse.json(responsePayload, {
      status: result.verified ? 200 : 422,
    });
  } catch (error: unknown) {
    console.error("API /api/otp/verify Error:", error);
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
