"use client";
import React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Lock, Phone, User, X } from "lucide-react";

interface CardDetails {
  name: string;
  registered_mobile_number: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
}

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardDetails: CardDetails) => void;
}

const CardDetailsModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CardDetailsModalProps) => {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    name: "",
    registered_mobile_number: "",
    card_number: "",
    cvv: "",
    expiry_month: "",
    expiry_year: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardDetails);
    onClose();
  };

  const handleInputChange =
    (field: keyof CardDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCardDetails((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="bg-[#C68D07] text-white p-4 -mx-6 -mt-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <DialogTitle className="text-xl">Secure Card Payment</DialogTitle>
            </div>
            <button onClick={onClose} className="text-white hover:opacity-75">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Card Preview */}
        <div className="relative mt-4 mb-6">
          <div className="bg-gradient-to-r from-[#C68D07] to-[#D6B56F] p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div className="text-white space-y-1">
                <p className="text-sm opacity-75">Card Number</p>
                <p className="font-mono text-lg">
                  {cardDetails.card_number
                    ? cardDetails.card_number.match(/.{1,4}/g)?.join(" ") ||
                      "XXXX XXXX XXXX XXXX"
                    : "XXXX XXXX XXXX XXXX"}
                </p>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/30"></div>
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
            </div>
            <div className="flex justify-between text-white">
              <div className="space-y-1">
                <p className="text-sm opacity-75">Card Holder</p>
                <p className="font-medium">{cardDetails.name || "YOUR NAME"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-75">Expires</p>
                <p className="font-medium">
                  {cardDetails.expiry_month || "MM"}/
                  {cardDetails.expiry_year?.slice(-2) || "YY"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center space-x-2 text-gray-700"
              >
                <User className="w-4 h-4 text-[#C68D07]" />
                <span>Cardholder Name</span>
              </Label>
              <Input
                id="name"
                value={cardDetails.name}
                onChange={handleInputChange("name")}
                placeholder="John Doe"
                required
                className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="mobile"
                className="flex items-center space-x-2 text-gray-700"
              >
                <Phone className="w-4 h-4 text-[#C68D07]" />
                <span>Registered Mobile Number</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={cardDetails.registered_mobile_number}
                onChange={handleInputChange("registered_mobile_number")}
                placeholder="0921XXXXXXX"
                required
                pattern="[0-9]{10,12}"
                className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="card_number"
                className="flex items-center space-x-2 text-gray-700"
              >
                <CreditCard className="w-4 h-4 text-[#C68D07]" />
                <span>Card Number</span>
              </Label>
              <Input
                id="card_number"
                value={cardDetails.card_number}
                onChange={handleInputChange("card_number")}
                placeholder="4XXX XXXX XXXX XXXX"
                required
                maxLength={16}
                pattern="[0-9]{16}"
                className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07] font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label
                  htmlFor="expiry_month"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Calendar className="w-4 h-4 text-[#C68D07]" />
                  <span>Expiry Date</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="expiry_month"
                    value={cardDetails.expiry_month}
                    onChange={handleInputChange("expiry_month")}
                    placeholder="MM"
                    required
                    maxLength={2}
                    pattern="(0[1-9]|1[0-2])"
                    className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                  />
                  <Input
                    id="expiry_year"
                    value={cardDetails.expiry_year}
                    onChange={handleInputChange("expiry_year")}
                    placeholder="YYYY"
                    required
                    maxLength={4}
                    pattern="20[2-9][0-9]"
                    className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="cvv"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Lock className="w-4 h-4 text-[#C68D07]" />
                  <span>CVV</span>
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={handleInputChange("cvv")}
                  placeholder="***"
                  required
                  maxLength={3}
                  pattern="[0-9]{3}"
                  className="border-gray-300 focus:border-[#C68D07] focus:ring-[#C68D07]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Your payment info is secure</span>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#C68D07] hover:bg-[#D6B56F] text-white"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailsModal;
