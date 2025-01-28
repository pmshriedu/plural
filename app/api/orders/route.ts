// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createOrder, getToken } from "@/lib/api";
import { OrderDetails } from "@/types/payment";

export async function POST(request: NextRequest) {
  try {
    const { amount, reference, purchase_details } = await request.json();

    // Enhanced validation
    if (!amount?.value || amount.value <= 0) {
      return NextResponse.json(
        { error: "Invalid amount value" },
        { status: 400 }
      );
    }

    if (!purchase_details?.customer) {
      return NextResponse.json(
        { error: "Customer details are required" },
        { status: 400 }
      );
    }

    const requiredFields = [
      "customer_id",
      "email_id",
      "first_name",
      "last_name",
      "mobile_number",
    ];

    const missingFields = requiredFields.filter(
      (field) => !purchase_details.customer[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required customer fields",
          fields: missingFields,
        },
        { status: 400 }
      );
    }

    const { access_token } = await getToken();

    // Fix: Properly construct the callback URL
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_BASE_URL
        : "http://localhost:3000";

    // Ensure the callback URL is properly formatted
    const callbackUrl =
      `${baseUrl}/success?` +
      new URLSearchParams({
        merchant_id: process.env.PLURAL_MERCHANT_ID || "",
        order_id: reference,
        amount: amount.value.toString(),
        name: `${purchase_details.customer.first_name} ${purchase_details.customer.last_name}`,
        email: purchase_details.customer.email_id,
        mobile: purchase_details.customer.mobile_number,
      }).toString();

    const orderDetails: OrderDetails = {
      order_amount: amount,
      merchant_order_reference: reference,
      type: "CHARGE",
      notes: `Order for ${purchase_details.customer.first_name} ${purchase_details.customer.last_name}`,
      callback_url: callbackUrl,
      purchase_details: {
        customer: {
          email_id: purchase_details.customer.email_id,
          first_name: purchase_details.customer.first_name,
          last_name: purchase_details.customer.last_name,
          customer_id: purchase_details.customer.customer_id,
          mobile_number: purchase_details.customer.mobile_number,
          billing_address: {
            address1: purchase_details.customer.billing_address.address1,
            address2: purchase_details.customer.billing_address.address2,
            address3: purchase_details.customer.billing_address.address3 || "",
            pincode: purchase_details.customer.billing_address.pincode,
            city: purchase_details.customer.billing_address.city,
            state: purchase_details.customer.billing_address.state,
            country: purchase_details.customer.billing_address.country,
          },
          shipping_address: {
            address1: purchase_details.customer.billing_address.address1,
            address2: purchase_details.customer.billing_address.address2,
            address3: purchase_details.customer.billing_address.address3 || "",
            pincode: purchase_details.customer.billing_address.pincode,
            city: purchase_details.customer.billing_address.city,
            state: purchase_details.customer.billing_address.state,
            country: purchase_details.customer.billing_address.country,
          },
        },
        merchant_metadata: {
          key1: "XD",
          key2: "ER",
        },
      },
    };

    // Log the constructed callback URL for debugging
    console.log("Callback URL:", callbackUrl);

    // Add request logging
    console.log("Creating order with details:", {
      reference,
      amount: amount.value,
      customerEmail: purchase_details.customer.email_id,
      timestamp: new Date().toISOString(),
    });

    const order = await createOrder(access_token, orderDetails);

    // Add response logging
    console.log("Order created successfully:", {
      orderId: order.data.order_id,
      status: order.data.status,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      data: order.data,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: Error | unknown) {
    // Enhanced error logging
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          // Add other expected error response data fields here
          [key: string]: unknown;
        };
        status?: number;
      };
      message?: string;
      stack?: string;
      code?: string;
    };

    console.error("Order creation failed:", {
      error: errorResponse.response?.data || errorResponse.message,
      timestamp: new Date().toISOString(),
      stack: errorResponse.stack,
    });

    // Determine appropriate error message and status
    let errorMessage = "Failed to create order";
    let statusCode = 500;

    if (errorResponse.response) {
      errorMessage = errorResponse.response.data?.message || errorMessage;
      statusCode = errorResponse.response.status || statusCode;
    }

    // Check for specific error types
    if (errorResponse.code === "ECONNREFUSED") {
      errorMessage = "Payment service is currently unavailable";
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
