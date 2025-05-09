// app/admin/products/edit/[id]/page.tsx
import EditProductForm from "@/admin/components/Admin_Products/EditProductForm";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchProductById } from "@/services/productApi";
import { IProduct } from "@/types/index";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params để lấy id
  const product = await fetchProductById(id);

  if (!product) {
    return (
      <AdminLayout
        pageTitle={`Chỉnh sửa sản phẩm #${id}`}
        pageSubtitle="Chỉnh sửa thông tin sản phẩm."
      >
        <div className="text-center text-lg text-red-500">
          {"Không tìm thấy sản phẩm."}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Chỉnh sửa sản phẩm #${id}`}
      pageSubtitle="Chỉnh sửa thông tin sản phẩm."
    >
      <div className="edit-product h-auto w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">
          Chỉnh sửa sản phẩm
        </h2>
        <EditProductForm product={product} productId={id} />
      </div>
    </AdminLayout>
  );
}
