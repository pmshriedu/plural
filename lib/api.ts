//File : /lib/api.ts

import axios from "axios";
import { config } from "@/config";
import { OrderDetails, PaymentRequest, TokenResponse } from "@/types/payment";

const api = axios.create({
  baseURL: config.baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getToken = async (): Promise<TokenResponse> => {
  const response = await api.post("/auth/v1/token", {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "client_credentials",
  });
  return response.data;
};

export const createOrder = async (
  token: string,
  orderDetails: OrderDetails
) => {
  const response = await api.post("/pay/v1/orders", orderDetails, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createPayment = async (
  token: string,
  orderId: string,
  paymentRequest: PaymentRequest
) => {
  const response = await api.post(
    `/pay/v1/orders/${orderId}/payments`,
    paymentRequest,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};
