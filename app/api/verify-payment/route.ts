// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { orderId, merchantId } = await request.json();

    if (!orderId || !merchantId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { access_token } = await getToken();

    const response = await fetch(
      `${process.env.PLURAL_BASE_URL}/api/pay/v1/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status,
      transactionId: data.transaction_id,
      success: true,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
