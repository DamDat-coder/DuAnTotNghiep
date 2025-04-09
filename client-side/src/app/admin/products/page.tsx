

// app/admin/products/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts } from "@/services/api";
import Image from "next/image";
import { IProduct } from "@/types";
interface SortConfig {
  key: "name" | "price";
  direction: "asc" | "desc";
}

export default function ProductsPage() {
  const router = useRouter();

  const navigationItems = [
    { label: "Danh sách sản phẩm", href: "/admin/products/list" },
  ];

  const [products, setProducts] = useState<IProduct[]>([]);
  const [sortedProducts, setSortedProducts] = useState<IProduct[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        console.log("Dữ liệu sản phẩm từ API:", data);
        setProducts(data);
        setSortedProducts(data);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleSort = (key: "name" | "price") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedProducts].sort((a, b) => {
      if (key === "name") {
        return direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (key === "price") {
        return direction === "asc" ? a.price - b.price : b.price - a.price;
      }
      return 0;
    });

    setSortedProducts(sorted);
    setSortConfig({ key, direction });
  };

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
      try {
        const response = await fetch(`https://67e3b0622ae442db76d1204c.mockapi.io/products/${productId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Không thể xoá sản phẩm.");
        setProducts(products.filter((product) => product.id !== productId));
        setSortedProducts(sortedProducts.filter((product) => product.id !== productId));
        alert("Xoá sản phẩm thành công!");
      } catch (err) {
        alert("Có lỗi xảy ra khi xoá sản phẩm.");
      }
    }
  };

  return (
    <AdminLayout
      pageTitle="Sản phẩm"
      pageSubtitle="Quản lý sản phẩm."
      navigationItems={navigationItems}
      addButton={{ label: "Thêm sản phẩm", href: "/admin/products/add" }} // Truyền nút Thêm
    >
      <div className="products-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8 h-full flex flex-col">
        {/* Bảng sản phẩm */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <p className="text-center text-lg">Đang tải...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : (
            <table className="w-full">
              <thead className="sticky -top-2 bg-white shadow-sm z-10 border-b border-gray-200">
                <tr className="text-center">
                  <th className="py-4 px-6 text-base font-medium">Ảnh</th>
                  <th className="py-4 px-6 text-base font-medium">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-2 mx-auto">
                      Tên sản phẩm
                      <span>{sortConfig?.key === "name" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                    </button>
                  </th>
                  <th className="py-4 px-6 text-base font-medium">
                    <button onClick={() => handleSort("price")} className="flex items-center gap-2 mx-auto">
                      Giá sản phẩm
                      <span>{sortConfig?.key === "price" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                    </button>
                  </th>
                  <th className="py-4 px-6 text-base font-medium">Danh mục</th>
                  <th className="py-4 px-6 text-base font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => {
                  const imageSrc = product.image ? `/featured/${product.image}` : null;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 text-center">
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6 text-base">{product.name}</td>
                      <td className="py-4 px-6 text-base font-bold">{product.price.toLocaleString()} VNĐ</td>
                      <td className="py-4 px-6 text-base font-medium">{product.category}</td>
                      <td className="py-4 px-6">
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
}