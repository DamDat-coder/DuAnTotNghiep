// src/admin/components/ProductsTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavigation from "../AdminNavigation";
import Image from "next/image";
import { IProduct } from "@/types/product";
import { fetchWithAuth } from "@/services/api";

interface SortConfig {
  key: "name" | "price";
  direction: "asc" | "desc";
}

interface ProductsTableProps {
  initialProducts: IProduct[];
  navigationItems: { label: string; href: string; filter?: string }[];
  addButton: { label: string; href: string };
}

export default function ProductsTable({
  initialProducts,
  navigationItems,
  addButton,
}: ProductsTableProps) {
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Hàm sắp xếp
  const handleSort = (key: "name" | "price") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...products].sort((a, b) => {
      if (key === "name") {
        return direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (key === "price") {
        // Đặt giá trị mặc định là 0 nếu price là undefined
        const priceA = a.price ?? 0;
        const priceB = b.price ?? 0;
        return direction === "asc" ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });

    setProducts(sorted);
    setSortConfig({ key, direction });
  };

  // Hàm chỉnh sửa
  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`);
  };

  // Hàm xóa
  const handleDelete = async (productId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const response = await fetchWithAuth(
          `http://localhost:3000/products/${productId}`,
          
          { method: "DELETE" }
        );
        const updatedProducts = products.filter((product) => product.id !== productId);
        setProducts(updatedProducts);
        alert("Xóa sản phẩm thành công!");
      } catch (err) {
        alert("Có lỗi xảy ra khi xóa sản phẩm.");
      }
    }
  };

  return (
    <>
      {/* Container 1: AdminNavigation */}
      <AdminNavigation
        items={navigationItems}
        addButton={addButton}
        currentFilter={""}
      />

      {/* Container 2: Bảng sản phẩm */}
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-[2.125rem] px-12 py-8 bg-white">
        <table className="w-full">
          <thead className="sticky -top-10 bg-white shadow-sm z-10 border-b border-gray-200">
            <tr className="text-center">
              <th className="py-4 px-6 text-base font-medium">Ảnh</th>
              <th className="py-4 px-6 text-base font-medium">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 mx-auto"
                >
                  Tên sản phẩm
                  <span>
                    {sortConfig?.key === "name" && sortConfig.direction === "desc" ? "↓" : "↑"}
                  </span>
                </button>
              </th>
              <th className="py-4 px-6 text-base font-medium">
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center gap-2 mx-auto"
                >
                  Giá sản phẩm
                  <span>
                    {sortConfig?.key === "price" && sortConfig.direction === "desc" ? "↓" : "↑"}
                  </span>
                </button>
              </th>
              <th className="py-4 px-6 text-base font-medium">Danh mục</th>
              <th className="py-4 px-6 text-base font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              // Lấy ảnh đầu tiên từ mảng image (nếu là mảng) hoặc image trực tiếp (nếu là chuỗi)
              const firstImage = Array.isArray(product.images)
                ? product.images[0]
                : product.images;

              const imageSrc = firstImage ? `/product/img/${firstImage}` : null;

              return (
                <tr key={product.id} className="hover:bg-gray-50 text-center">
                  <td className="py-4 px-6 align-middle">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        width={250}
                        height={250}
                        className="mx-auto rounded"
                        onError={(e) => {
                          console.log(`Không thể tải ảnh: ${imageSrc}`);
                          e.currentTarget.style.display = "none";
                        }}
                        style={{ display: "block" }}
                      />
                    ) : null}
                    <div
                      className="w-[50px] h-[50px] mx-auto bg-gray-200 rounded flex items-center justify-center"
                      style={{ display: imageSrc ? "none" : "flex" }}
                    >
                      <span className="text-gray-500">No Image</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-base align-middle">{product.name}</td>
                  <td className="py-4 px-6 text-base font-bold align-middle">
                    {(product.price ?? 0).toLocaleString()} VNĐ
                  </td>
                  <td className="py-4 px-6 text-base font-medium align-middle">{product.category}</td>
                  <td className="py-4 px-6 align-middle">
                    <div className="w-full flex gap-4 justify-center items-center">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}