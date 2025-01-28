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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Card Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                value={cardDetails.name}
                onChange={handleInputChange("name")}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={cardDetails.registered_mobile_number}
                onChange={handleInputChange("registered_mobile_number")}
                placeholder="0921XXXXXXX"
                required
                pattern="[0-9]{10,12}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                value={cardDetails.card_number}
                onChange={handleInputChange("card_number")}
                placeholder="4XXX XXXX XXXX XXXX"
                required
                maxLength={16}
                pattern="[0-9]{16}"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry_month">Month</Label>
                <Input
                  id="expiry_month"
                  value={cardDetails.expiry_month}
                  onChange={handleInputChange("expiry_month")}
                  placeholder="MM"
                  required
                  maxLength={2}
                  pattern="(0[1-9]|1[0-2])"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_year">Year</Label>
                <Input
                  id="expiry_year"
                  value={cardDetails.expiry_year}
                  onChange={handleInputChange("expiry_year")}
                  placeholder="YYYY"
                  required
                  maxLength={4}
                  pattern="20[2-9][0-9]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={handleInputChange("cvv")}
                  placeholder="***"
                  required
                  maxLength={3}
                  pattern="[0-9]{3}"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailsModal;
