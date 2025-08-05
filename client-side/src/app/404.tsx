import { Suspense } from "react";

export default function Custom404() {
  return (
    <Suspense fallback={<div>Đang tải trang 404...</div>}>
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold">404 - Không tìm thấy trang</h1>
        <p className="mt-2">Xin lỗi, đường dẫn bạn truy cập không tồn tại.</p>
      </div>
    </Suspense>
  );
}
