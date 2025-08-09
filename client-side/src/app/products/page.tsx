import ProductsClient from "@/components/Products/ProductsClient";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsClient />
    </Suspense>
  );
}
