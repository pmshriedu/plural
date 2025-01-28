// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken, createPayment } from "@/lib/api";
import { PaymentRequest, CardDetails } from "@/types/payment";

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentRequest } = await request.json();
    const { access_token } = await getToken();

    // Validate the incoming payment request
    if (!paymentRequest?.payments?.[0]?.payment_option?.card_details) {
      return NextResponse.json(
        { error: "Card details are required" },
        { status: 400 }
      );
    }

    const cardDetails: CardDetails =
      paymentRequest.payments[0].payment_option.card_details;

    // Validate required card fields
    const requiredFields: (keyof CardDetails)[] = [
      "name",
      "registered_mobile_number",
      "card_number",
      "cvv",
      "expiry_month",
      "expiry_year",
    ];

    const missingFields = requiredFields.filter((field) => !cardDetails[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required card fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Build the enhanced payment request with the provided card details
    const enhancedPaymentRequest: PaymentRequest = {
      payments: [
        {
          payment_amount: paymentRequest.payments[0].payment_amount,
          payment_option: {
            card_details: cardDetails,
          },
          payment_method: "CARD",
          merchant_payment_reference: crypto.randomUUID(),
        },
      ],
    };

    const payment = await createPayment(
      access_token,
      orderId,
      enhancedPaymentRequest
    );

    return NextResponse.json(payment);
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
      "Payment creation error:",
      errorResponse.response?.data || errorResponse.message
    );

    // Enhanced error handling
    const errorMessage =
      errorResponse.response?.data?.message || "Failed to create payment";
    const statusCode = errorResponse.response?.status || 500;

    // Log additional details for debugging (in production, ensure sensitive data is redacted)
    console.error("Payment creation failed:", {
      statusCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
