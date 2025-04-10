// app/admin/products/edit/[id]/page.tsx
import EditProductForm from "@/admin/components/Admin_Products/EditProductForm";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { IProduct } from "@/types/index";


async function fetchProduct(id: string) {
  try {
    const response = await fetch(
      `https://67e3b0622ae442db76d1204c.mockapi.io/products/${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm.");
    const data: IProduct = await response.json();
    return { product: data, error: null };
  } catch (err) {
    return {
      product: null,
      error: "Có lỗi xảy ra khi tải thông tin sản phẩm.",
    };
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params để lấy id
  const { product, error } = await fetchProduct(id);

  if (error || !product) {
    return (
      <AdminLayout
        pageTitle={`Chỉnh sửa sản phẩm #${id}`}
        pageSubtitle="Chỉnh sửa thông tin sản phẩm."
      >
        <div className="text-center text-lg text-red-500">
          {error || "Không tìm thấy sản phẩm."}
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
