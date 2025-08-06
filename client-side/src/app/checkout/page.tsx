// /app/checkout/page.tsx

import Checkout from "@/components/Checkout/CheckoutContent";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Checkout />
    </Suspense>
  );
}