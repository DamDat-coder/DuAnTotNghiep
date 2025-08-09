import { Suspense } from "react";
import { ProductContent } from "@/components/Detail/ProductContent";
interface PageProps {
  params: Promise<{ id: string }>; // Thêm Promise
}
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <ProductContent id={id} />
    </Suspense>
  );
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";
