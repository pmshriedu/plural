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
import { Download, CheckCircle, XCircle, HomeIcon } from "lucide-react";

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
        const orderId = searchParams.get("order_id");
        const status = searchParams.get("status");

        if (!orderId) {
          throw new Error("Order ID not found");
        }

        const mockPaymentDetails: PaymentDetails = {
          orderId,
          transactionId: "TXN" + Math.random().toString(36).substr(2, 9),
          amount: searchParams.get("amount") || "0",
          status: status || "SUCCESS",
          timestamp: new Date().toISOString(),
          customerName: decodeURIComponent(
            searchParams.get("name") || "Customer"
          ),
          customerEmail: decodeURIComponent(
            searchParams.get("email") || "customer@example.com"
          ),
        };

        setTimeout(() => {
          setPaymentDetails(mockPaymentDetails);
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error("Error fetching payment status:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch payment status"
        );
        setLoading(false);
      }
    };

    fetchPaymentStatus();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paymentDetails?.status === "SUCCESS" ? (
              <>
                <CheckCircle className="text-green-500" />
                <span>Payment Successful</span>
              </>
            ) : (
              <>
                <XCircle className="text-red-500" />
                <span>Payment Failed</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentDetails?.status === "SUCCESS" ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle>Transaction Complete</AlertTitle>
              <AlertDescription>
                Your payment has been processed successfully.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Transaction Failed</AlertTitle>
              <AlertDescription>
                There was an issue processing your payment. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {paymentDetails && (
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{paymentDetails.orderId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium">
                  {paymentDetails.transactionId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">₹{paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(paymentDetails.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Customer</span>
                <span className="font-medium">
                  {paymentDetails.customerName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">
                  {paymentDetails.customerEmail}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {paymentDetails?.status === "SUCCESS" && (
            <Button
              onClick={downloadReceipt}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Download size={16} />
              Download Receipt
            </Button>
          )}
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
