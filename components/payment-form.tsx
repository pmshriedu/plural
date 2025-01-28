"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardDetails } from "@/types/payment";
import CardDetailsModal from "./card-modal";

interface BillingAddress {
  address1: string;
  address2: string;
  address3: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    customerId: crypto.randomUUID().replace(/-/g, "").substring(0, 28),
    billingAddress: {
      address1: "",
      address2: "",
      address3: "",
      pincode: "",
      city: "",
      state: "",
      country: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as BillingAddress),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardDetails) {
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    setOrderStatus("Processing order...");

    try {
      const amountInPaise = Math.round(Number(formData.amount) * 100);
      const reference = crypto.randomUUID();

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: {
            value: amountInPaise,
            currency: "INR",
          },
          reference: reference,
          purchase_details: {
            customer: {
              email_id: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              customer_id: formData.customerId,
              mobile_number: formData.mobileNumber,
              billing_address: formData.billingAddress,
              shipping_address: formData.billingAddress, // Using same address for shipping
            },
            merchant_metadata: {
              key1: "DD",
              key2: "XOF",
            },
          },
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderRes.json();
      setOrderStatus("Creating payment...");

      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.data.order_id,
          paymentRequest: {
            payments: [
              {
                payment_amount: {
                  value: amountInPaise,
                  currency: "INR",
                },
                merchant_payment_reference: crypto.randomUUID(),
                payment_method: "CARD",
                payment_option: {
                  card_details: cardDetails,
                  card_data: {
                    card_type: "CREDIT",
                    token_txn_type: "ALT_TOKEN",
                  },
                },
              },
            ],
          },
        }),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const paymentData = await paymentRes.json();

      if (paymentData.data.challenge_url) {
        setOrderStatus("Redirecting to payment gateway...");
        window.location.href = paymentData.data.challenge_url;
      } else {
        setError("No payment URL received");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setError(
        error instanceof Error ? error.message : "Payment processing failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCardDetailsSubmit = (details: CardDetails) => {
    setCardDetails(details);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>
            Make Payment ({process.env.NEXT_PUBLIC_ENVIRONMENT})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (in ₹)
              </label>
              <Input
                type="number"
                name="amount"
                placeholder="Enter amount in Rupees"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Amount to be paid: ₹{formData.amount} (₹
                {(Number(formData.amount) * 100).toFixed(0)} paise)
              </p>
            </div>

            {/* Personal Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Billing Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address Line 1
                  </label>
                  <Input
                    type="text"
                    name="billingAddress.address1"
                    value={formData.billingAddress.address1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address Line 2
                  </label>
                  <Input
                    type="text"
                    name="billingAddress.address2"
                    value={formData.billingAddress.address2}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    type="text"
                    name="billingAddress.city"
                    value={formData.billingAddress.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State
                  </label>
                  <Input
                    type="text"
                    name="billingAddress.state"
                    value={formData.billingAddress.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode
                  </label>
                  <Input
                    type="text"
                    name="billingAddress.pincode"
                    value={formData.billingAddress.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <Input
                    type="text"
                    name="billingAddress.country"
                    value={formData.billingAddress.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {orderStatus && !error && (
              <Alert>
                <AlertDescription>{orderStatus}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                loading || !formData.amount || Number(formData.amount) <= 0
              }
              className="w-full"
            >
              {cardDetails ? "Pay Now" : "Enter Card Details"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <CardDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCardDetailsSubmit}
      />
    </>
  );
};

export default PaymentForm;
