// app/callback/page.tsx
"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download,
  CheckCircle,
  XCircle,
  HomeIcon,
  Mail,
  User,
  CreditCard,
  Clock,
  Receipt,
} from "lucide-react";
import Image from "next/image";

interface PaymentDetails {
  orderId: string;
  transactionId: string;
  amount: string;
  status: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
}

const PaymentCallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);

        // Validate required URL parameters
        const params = {
          orderId: searchParams.get("order_id"),
          amount: searchParams.get("amount"),
          name: searchParams.get("name"),
          email: searchParams.get("email"),
          status: searchParams.get("status"),
        };

        // Check if any required parameter is missing or invalid
        if (
          !params.orderId ||
          !params.amount ||
          !params.name ||
          !params.email
        ) {
          throw new Error("Missing required payment parameters");
        }

        // Safely decode URL parameters
        const decodedName = decodeURIComponent(params.name || "");
        const decodedEmail = decodeURIComponent(params.email || "");

        const mockPaymentDetails: PaymentDetails = {
          orderId: params.orderId,
          transactionId: "TXN" + Math.random().toString(36).substr(2, 9),
          amount: params.amount,
          status: params.status || "SUCCESS",
          timestamp: new Date().toISOString(),
          customerName: decodedName || "Customer",
          customerEmail: decodedEmail || "customer@example.com",
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPaymentDetails(mockPaymentDetails);
        setLoading(false);
      } catch (error) {
        console.error("Error processing payment callback:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to process payment callback"
        );
        setLoading(false);
      }
    };

    // Only fetch if we have search params
    if (searchParams.toString()) {
      fetchPaymentStatus();
    }
  }, [searchParams]);

  const downloadReceipt = () => {
    if (!paymentDetails) return;

    const receipt = `
Payment Receipt
--------------
Order ID: ${paymentDetails.orderId}
Transaction ID: ${paymentDetails.transactionId}
Amount: ₹${paymentDetails.amount}
Status: ${paymentDetails.status}
Date: ${new Date(paymentDetails.timestamp).toLocaleString()}
Customer: ${paymentDetails.customerName}
Email: ${paymentDetails.customerEmail}
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-receipt-${paymentDetails.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="text-center mt-4">Processing payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="text-red-500" />
              <span>Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/")}
              className="w-full flex items-center gap-2"
            >
              <HomeIcon size={16} />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no payment details, redirect to home
  if (!paymentDetails) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo Section */}
        <div className="text-center mb-8 mt-14">
          <div className=" mx-auto mb-4 flex items-center justify-center ">
            <Image src="/logo-gold.png" alt="Logo" width={120} height={120} />
          </div>
        </div>

        {loading ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#C68D07] border-t-transparent animate-spin"></div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Processing Payment
                  </h3>
                  <p className="text-gray-500">
                    Please wait while we verify your transaction...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="w-6 h-6" />
                <span>Transaction Failed</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error Processing Payment</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="bg-gray-50 p-6">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-[#C68D07] hover:bg-[#D6B56F] text-white"
              >
                <HomeIcon size={18} className="mr-2" />
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        ) : paymentDetails ? (
          <Card className="shadow-lg border-0">
            <CardHeader
              className={`${
                paymentDetails.status === "SUCCESS"
                  ? "bg-green-50 border-b border-green-100"
                  : "bg-red-50 border-b border-red-100"
              }`}
            >
              <CardTitle
                className={`flex items-center gap-2 ${
                  paymentDetails.status === "SUCCESS"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {paymentDetails.status === "SUCCESS" ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Payment Successful</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    <span>Payment Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {paymentDetails.status === "SUCCESS" ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertTitle>Transaction Complete</AlertTitle>
                  <AlertDescription>
                    Your payment has been processed successfully. A confirmation
                    email has been sent.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertTitle>Transaction Failed</AlertTitle>
                  <AlertDescription>
                    There was an issue processing your payment. Please try again
                    or contact support.
                  </AlertDescription>
                </Alert>
              )}

              {/* Transaction Details Card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Receipt className="w-4 h-4 text-[#C68D07]" />
                    <span>Order ID</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.orderId}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CreditCard className="w-4 h-4 text-[#C68D07]" />
                    <span>Transaction ID</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.transactionId}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4 text-[#C68D07]" />
                    <span>Date & Time</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(paymentDetails.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4 text-[#C68D07]" />
                    <span>Customer</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.customerName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#C68D07]" />
                    <span>Email</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.customerEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-[#C68D07]">
                    ₹{paymentDetails.amount}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 p-6 flex flex-col gap-3">
              {paymentDetails.status === "SUCCESS" && (
                <Button
                  onClick={downloadReceipt}
                  variant="outline"
                  className="w-full border-[#C68D07] text-[#C68D07] hover:bg-[#C68D07] hover:text-white"
                >
                  <Download size={18} className="mr-2" />
                  Download Receipt
                </Button>
              )}
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-[#C68D07] hover:bg-[#D6B56F] text-white"
              >
                <HomeIcon size={18} className="mr-2" />
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        ) : null}

        {/* Footer Security Badges */}
        <div className="mt-8 flex justify-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <CheckCircle className="w-4 h-4 text-[#C68D07]" />
            <span className="text-sm">Secure Transaction</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="w-4 h-4 text-[#C68D07]" />
            <span className="text-sm">Email Receipt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with Suspense
const PaymentCallback = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
              <p className="text-center mt-4">Loading payment details...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
};

export default PaymentCallback;
