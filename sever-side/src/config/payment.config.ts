import { VNPay, HashAlgorithm } from "vnpay";

export const ZALO_PAY = {
  app_id: Number(process.env.ZALOPAY_APP_ID),
  key1: process.env.ZALOPAY_KEY1!,
  key2: process.env.ZALOPAY_KEY2!,
  endpoint: process.env.ZALOPAY_ENDPOINT!,
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL!,
  returnUrl: process.env.ZALOPAY_RETURN_URL!,
};

export const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  loggerFn: () => {},
});
