// app/admin/category/edit/[id]/page.tsx
import AdminLayout from "@/admin/layouts/AdminLayout";
import EditCategoryForm from "@/admin/components/EditCategoryForm";

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// Dữ liệu giả lập
const getCategoryById = (id: string): Category => {
  return {
    id,
    name: `Danh mục ${id}`,
    description: `Mô tả cho danh mục ${id}`,
    image: `category-${id}.jpg`,
  };
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Lấy id từ params
  const category = getCategoryById(id); // Lấy dữ liệu danh mục

  return (
    <AdminLayout
      pageTitle={`Sửa danh mục #${id}`}
      pageSubtitle="Chỉnh sửa thông tin danh mục."
    >
      <EditCategoryForm category={category} />
    </AdminLayout>
  );
}