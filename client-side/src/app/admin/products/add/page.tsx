// app/admin/products/add/page.tsx

import AdminLayout from "@/admin/layouts/AdminLayout";
import AddProductForm from "@/admin/components/Admin_Products/AddProductForm";

export default function AddProductPage() {
  return (
    <AdminLayout
      pageTitle="Thêm sản phẩm"
      pageSubtitle="Thêm sản phẩm mới vào hệ thống."
    >
      <div className="add-product h-auto w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">
          Thêm sản phẩm
        </h2>
        <AddProductForm />
      </div>
    </AdminLayout>
  );
}
