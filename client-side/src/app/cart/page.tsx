// /app/checkout/page.tsx

import CartContent from "@/components/Cart/CartContent";
import { Suspense } from "react";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartContent />
    </Suspense>
  );
}