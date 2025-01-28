"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardDetails } from "@/types/payment";
import CardDetailsModal from "./card-modal";
import { CreditCard, Lock, MapPin, User } from "lucide-react";
import Image from "next/image";

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

  const validateAmount = (value: string): boolean => {
    const amount = Number(value);
    return amount >= 100 && amount <= 100000000;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      // Only allow numeric input
      if (!/^\d*$/.test(value)) return;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name.includes(".")) {
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

    if (!validateAmount(formData.amount)) {
      setError(
        "Amount must be between ₹1 (100 paise) and ₹10 lakh (1 crore paise)"
      );
      return;
    }

    setLoading(true);
    setError("");
    setOrderStatus("Processing order...");

    try {
      const amountInPaise = Number(formData.amount);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className=" mx-auto mb-4 flex items-center justify-center ">
            <Image src="/logo-gold.png" alt="Logo" width={120} height={120} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
          <p className="mt-2 text-gray-600">
            Complete your transaction securely
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-[#C68D07] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Payment Details
                </h3>
              </div>
              <div className="text-white text-sm">
                {process.env.NEXT_PUBLIC_ENVIRONMENT}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Amount Section with styled container */}
              <div className="bg-[#D6B56F] bg-opacity-10 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Enter amount in paise"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="100"
                    max="100000000"
                    className="pl-8 border-[#C68D07] focus:ring-[#C68D07]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Amount: ₹{(Number(formData.amount) / 100).toFixed(2)} (
                  {formData.amount} paise)
                </p>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-[#C68D07]" />
                  <h3 className="font-bold text-gray-900">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#C68D07]" />
                  <h3 className="font-bold text-gray-900">Billing Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.address1"
                      value={formData.billingAddress.address1}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.address2"
                      value={formData.billingAddress.address2}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.city"
                      value={formData.billingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.state"
                      value={formData.billingAddress.state}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.pincode"
                      value={formData.billingAddress.pincode}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      type="text"
                      name="billingAddress.country"
                      value={formData.billingAddress.country}
                      onChange={handleInputChange}
                      required
                      className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {orderStatus && !error && (
                <Alert className="mt-6 bg-[#D6B56F] bg-opacity-10 border-[#C68D07]">
                  <AlertDescription>{orderStatus}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={
                  loading || !formData.amount || Number(formData.amount) <= 0
                }
                className="w-full bg-[#C68D07] hover:bg-[#D6B56F] text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>{cardDetails ? "Pay Now" : "Enter Card Details"}</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <CardDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCardDetailsSubmit}
        />
        {/* Security badges */}
        <div className="mt-8 flex justify-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Secure Payment</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
