// GoogleLoginButton.tsx
"use client";

import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";

interface GoogleLoginButtonProps {
  onLoginSuccess?: () => void;
}

export default function GoogleLoginButton({ onLoginSuccess }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const result = await loginWithGoogle(credentialResponse.credential);
        if (result && onLoginSuccess) {
          onLoginSuccess(); // ✅ Gọi callback để đóng popup
        }
      } catch (err) {
        console.error("Google login failed:", err);
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google login error")}
      useOneTap={false}
    />
  );
}
