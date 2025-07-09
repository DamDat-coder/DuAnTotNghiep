type ResetTokenData = {
  email: string;
  expiresAt: number;
  userId: string;
};
export const resetTokens = new Map<string, ResetTokenData>();
