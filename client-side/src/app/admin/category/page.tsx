// app/admin/categories/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: number;
  name: string;
  description: string;
}

// Định nghĩa kiểu dữ liệu cho cấu hình sắp xếp
interface SortConfig {
  key: "name";
  direction: "asc" | "desc";
}

// Dữ liệu mẫu
const sampleCategories: Category[] = [
  { id: 1, name: "Áo thun", description: "Danh mục áo thun nam và nữ" },
  { id: 2, name: "Quần jeans", description: "Danh mục quần jeans thời trang" },
  { id: 3, name: "Giày thể thao", description: "Danh mục giày thể thao phong cách" },
  { id: 4, name: "Phụ kiện", description: "Danh mục phụ kiện như mũ, kính" },
  { id: 5, name: "Túi xách", description: "Danh mục túi xách thời trang" },
  { id: 6, name: "Đồng hồ", description: "Danh mục đồng hồ cao cấp" },
  { id: 7, name: "Áo khoác", description: "Danh mục áo khoác mùa đông" },
  { id: 8, name: "Váy", description: "Danh mục váy nữ thời trang" },
  { id: 9, name: "Quần short", description: "Danh mục quần short năng động" },
  { id: 10, name: "Kính râm", description: "Danh mục kính râm phong cách" },
];

export default function CategoriesPage() {
  const router = useRouter();

  // Navigation items (giống trang Sản phẩm)
  const navigationItems = [
    { label: "Danh sách danh mục", href: "/admin/category" },
  ];

  // State cho dữ liệu danh mục, sắp xếp và trạng thái
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [sortedCategories, setSortedCategories] = useState<Category[]>(sampleCategories);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Giả lập fetch dữ liệu
  useEffect(() => {
    setLoading(true);
    setCategories(sampleCategories);
    setSortedCategories(sampleCategories);
    setLoading(false);
  }, []);

  // Hàm sắp xếp
  const handleSort = (key: "name") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedCategories].sort((a, b) => {
      if (key === "name") {
        return direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });

    setSortedCategories(sorted);
    setSortConfig({ key, direction });
  };

  // Hàm chỉnh sửa
  const handleEdit = (categoryId: number) => {
    router.push(`/admin/category/edit/${categoryId}`);
  };

  // Hàm xoá
  const handleDelete = (categoryId: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá danh mục này?")) {
      setCategories(categories.filter((category) => category.id !== categoryId));
      setSortedCategories(sortedCategories.filter((category) => category.id !== categoryId));
      alert("Xoá danh mục thành công!");
    }
  };

  return (
    <AdminLayout
      pageTitle="Danh mục"
      pageSubtitle="Quản lý danh mục."
      navigationItems={navigationItems}
      addButton={{ label: "Thêm danh mục", href: "/admin/category/add" }}
    >
      <div className="categories-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8 h-full flex flex-col">
        {/* Bảng danh mục */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <p className="text-center text-lg">Đang tải...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : (
            <table className="w-full">
              <thead className="sticky -top-2 bg-white shadow-sm z-10 border-b border-gray-200">
                <tr className="text-center">
                  <th className="py-4 px-6 text-base font-medium">STT</th>
                  <th className="py-4 px-6 text-base font-medium">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-2 mx-auto">
                      Tên danh mục
                      <span>{sortConfig?.key === "name" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                    </button>
                  </th>
                  <th className="py-4 px-6 text-base font-medium">Mô tả</th>
                  <th className="py-4 px-6 text-base font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50 text-center">
                    <td className="py-4 px-6 text-base font-bold">{index + 1}</td>
                    <td className="py-4 px-6 text-base font-bold">{category.name}</td>
                    <td className="py-4 px-6 text-base font-bold">{category.description}</td>
                    <td className="py-4 px-6">
                      <div className="w-full flex gap-4 justify-center items-center">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}