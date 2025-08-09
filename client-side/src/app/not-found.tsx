import { Suspense } from "react";

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <h1 className="text-3xl font-bold text-red-600">
        404 - Không tìm thấy trang
      </h1>
      <p className="mt-2">Trang bạn tìm không tồn tại.</p>
    </Suspense>
  );
}
