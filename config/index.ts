export const config = {
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "UAT",
  merchantId: process.env.PLURAL_MERCHANT_ID,
  clientId: process.env.PLURAL_CLIENT_ID,
  clientSecret: process.env.PLURAL_CLIENT_SECRET,
  baseUrl:
    process.env.NEXT_PUBLIC_ENVIRONMENT === "PROD"
      ? "https://api.pluralpay.in/api"
      : "https://pluraluat.v2.pinepg.in/api",
};
