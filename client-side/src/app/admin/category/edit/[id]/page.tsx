import AdminLayout from "@/admin/layouts/AdminLayout";

export default function EditCategoryPage() {
  return (
    <AdminLayout
      pageTitle="Không hỗ trợ sửa danh mục tại đây"
      pageSubtitle="Hãy sử dụng popup tại trang danh sách danh mục để sửa."
    >
      <div className="text-center py-10 text-red-500">
        Trang này không dùng để sửa trực tiếp!<br />
        Hãy sửa danh mục tại giao diện danh sách.
      </div>
    </AdminLayout>
  );
}
