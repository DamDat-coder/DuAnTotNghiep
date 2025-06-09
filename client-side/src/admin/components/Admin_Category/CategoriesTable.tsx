// src/admin/components/CategoriesTable.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/services/categoryApi";

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: number;
  name: string;
  description: string;
}

interface SortConfig {
  key: "name";
  direction: "asc" | "desc";
}

interface CategoriesTableProps {
  initialCategories: Category[];
  navigationItems: { label: string; href: string; filter?: string }[];
  addButton: { label: string; href: string };
}

export default function CategoriesTable({
  initialCategories,
  navigationItems,
  addButton,
}: CategoriesTableProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sortedCategories, setSortedCategories] =
    useState<Category[]>(initialCategories);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Giả lập fetch dữ liệu
  useEffect(() => {
    setLoading(true);
    setCategories(initialCategories);
    setSortedCategories(initialCategories);
    setLoading(false);
  }, [initialCategories]);

  // Hàm sắp xếp
  const handleSort = (key: "name") => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
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

  // ✅ Hàm xóa có gọi API thật
  const handleDelete = async (categoryId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      setLoading(true);
      const response = await deleteCategory(categoryId);
      if (response.status === "success") {
        const updated = categories.filter((c) => c.id !== categoryId);
        setCategories(updated);
        setSortedCategories(updated);
        alert("Xóa danh mục thành công!");
      } else {
        alert("Xóa không thành công. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Đã xảy ra lỗi khi xóa danh mục.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 rounded-[2.125rem] px-12 py-8 bg-white overflow-x-auto overflow-y-auto">
        {loading ? (
          <p className="text-center text-lg">Đang tải...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <table className="w-full">
            <thead className="sticky -top-10 bg-white shadow-sm z-10 border-b border-gray-200">
              <tr className="text-center">
                <th className="py-4 px-6 text-base font-medium">STT</th>
                <th className="py-4 px-6 text-base font-medium">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    Tên danh mục
                    <span>
                      {sortConfig?.key === "name" &&
                      sortConfig.direction === "desc"
                        ? "↓"
                        : "↑"}
                    </span>
                  </button>
                </th>
                <th className="py-4 px-6 text-base font-medium">Mô tả</th>
                <th className="py-4 px-6 text-base font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    Không có danh mục nào.
                  </td>
                </tr>
              ) : (
                sortedCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 text-center"
                  >
                    <td className="py-4 px-6 text-base font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-base font-bold">
                      {category.name}
                    </td>
                    <td className="py-4 px-6 text-base font-bold">
                      {category.description}
                    </td>
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
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
