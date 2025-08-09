// /app/payment/fail/page.tsx

import PaymentFailClient from "@/components/Payment/PaymentFailClient";
import { Suspense } from "react";

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailClient />
    </Suspense>
  );
}
