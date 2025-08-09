// /app/payment/success/page.tsx

import PaymentSuccessClient from "@/components/Payment/PaymentSuccessClient";
import { Suspense } from "react";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
