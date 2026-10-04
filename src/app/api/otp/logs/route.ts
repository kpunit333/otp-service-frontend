import { NextRequest, NextResponse } from "next/server";
import { otpEngine } from "@/lib/otp-store";
import { ApiResponse, PaginatedResult } from "@/types/api";
import { OtpLogItem } from "@/types/otp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const channel = searchParams.get("channel") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    let logs = otpEngine.getLogs();

    // Filters
    if (channel && channel !== "all") {
      logs = logs.filter((item) => item.channel === channel);
    }
    if (status && status !== "all") {
      logs = logs.filter((item) => item.status === status);
    }
    if (search) {
      logs = logs.filter(
        (item) =>
          item.recipient.toLowerCase().includes(search) ||
          item.requestId.toLowerCase().includes(search) ||
          item.provider.toLowerCase().includes(search)
      );
    }

    const total = logs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = logs.slice(startIndex, startIndex + limit);

    const result: PaginatedResult<OtpLogItem> = {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    const response: ApiResponse<PaginatedResult<OtpLogItem>> = {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        version: "v1",
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGS_QUERY_FAILED",
          message: error instanceof Error ? error.message : "Failed to fetch logs.",
        },
      },
      { status: 500 }
    );
  }
}
