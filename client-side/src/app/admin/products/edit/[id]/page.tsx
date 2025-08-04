import EditProductForm from "@/admin/components/Admin_Products/EditProductForm";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchProductById } from "@/services/productApi";

export default async function EditProductPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const { id } = params; // KHÔNG await nữa!
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
        <EditProductForm product={product} productId={id} onClose={() => {}} />
      </div>
    </AdminLayout>
  );
}
