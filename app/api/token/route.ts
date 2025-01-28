import { NextResponse } from "next/server";
import { getToken } from "@/lib/api";

export async function GET() {
  try {
    const token = await getToken();
    return NextResponse.json(token);
  } catch (error: Error | unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          [key: string]: unknown;
        };
        status?: number;
      };
      message?: string;
    };

    console.error(
      "Token generation error:",
      errorResponse.response?.data || errorResponse.message
    );
    return NextResponse.json(
      { error: "Failed to get token" },
      { status: errorResponse.response?.status || 500 }
    );
  }
}
