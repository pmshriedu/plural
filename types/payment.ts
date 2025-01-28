export interface OrderAmount {
  value: number;
  currency: string;
}

export type OrderDetails = {
  order_amount: number;
  merchant_order_reference: string;
  type: string;
  notes: string;
  callback_url: string;
  purchase_details: {
    customer: {
      email_id: string;
      first_name: string;
      last_name: string;
      customer_id: string;
      mobile_number: string;
      billing_address: {
        address1: string;
        address2: string;
        address3: string;
        pincode: string;
        city: string;
        state: string;
        country: string;
      };
      shipping_address: {
        address1: string;
        address2: string;
        address3: string;
        pincode: string;
        city: string;
        state: string;
        country: string;
      };
    };
    merchant_metadata: {
      key1: string;
      key2: string;
    };
  };
};

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface OrderResponse {
  data: {
    order_id: string;
    merchant_order_reference: string;
    type: string;
    status: string;
    challenge_url?: string;
    merchant_id: string;
    order_amount: OrderAmount;
    pre_auth: boolean;
    notes?: string;
    callback_url?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CardDetails {
  name: string;
  registered_mobile_number: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
}

export interface CardData {
  card_type?: "CREDIT" | "DEBIT";
  network_name?: string;
  issuer_name?: string;
  card_category?:
    | "CONSUMER"
    | "COMMERCIAL"
    | "PREMIUM"
    | "SUPER_PREMIUM"
    | "PLATINUM"
    | "OTHER"
    | "BUSINESS"
    | "GOVERNMENT_NOTES"
    | "PAYOUTS"
    | "ELITE"
    | "STANDARD";
  country_code?: string;
  token_txn_type?: "ALT_TOKEN" | "NETWORK_TOKEN" | "ISSUER_TOKEN";
  card_details?: CardDetails; // Add card_details to CardData
}

export interface PaymentOption {
  card_details?: CardDetails;
}

export interface Payment {
  payment_amount: OrderAmount;
  merchant_payment_reference: string;
  payment_method: "CARD" | "UPI" | "POINTS";
  payment_option: PaymentOption;
}

export interface PaymentRequest {
  payments: Payment[];
}
