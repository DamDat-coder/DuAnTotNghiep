import Payment from '../models/payment.model';

function generateTransactionCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateUniqueTransactionCode(prefix: string): Promise<string> {
  while (true) {
    const randomCode = generateTransactionCode();
    const code = `${prefix}-${randomCode}`;
    const exists = await Payment.findOne({ transaction_code: code });

    if (!exists) return code;
  }
}
