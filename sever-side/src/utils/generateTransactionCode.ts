import Payment from "../models/payment.model";

function generateShortCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function generateUniqueTransactionCode(prefix: string, maxTries = 10): Promise<string> {
  const minuteCode = new Date().getMinutes().toString().padStart(2, "0"); 

  for (let i = 0; i < maxTries; i++) {
    const code = `${prefix}-${generateShortCode(6)}${minuteCode}`;
    const exists = await Payment.findOne({ transaction_code: code });
    if (!exists) return code;
  }

  throw new Error("Không thể tạo transaction_code duy nhất!");
}
