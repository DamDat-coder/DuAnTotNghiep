import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";

export const credentials = new Auth({
  apiKey: process.env.VONAGE_API_KEY!,
  apiSecret: process.env.VONAGE_API_SECRET!,
});

export const vonage = new Vonage(credentials);
export const otpMap = new Map<string, string>();
