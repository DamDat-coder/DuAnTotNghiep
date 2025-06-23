"use client";
import { useEffect, useState } from "react";
import ProductControlBar from "./ProductControlBar";
import ProductBody from "./ProductBody";
import Image from "next/image";
import { Pagination } from "../ui/Panigation";
import { lockProduct, deleteProduct } from "@/services/productApi";

export default function ProductTableWrapper({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  // Sử dụng đúng is_active, KHÔNG dùng active nữa!
  const [localProducts, setLocalProducts] = useState(
    Array.isArray(products) ? products : []
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    setLocalProducts(Array.isArray(products) ? products : []);
  }, [products]);

  // Filter + search
  const filtered = localProducts.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? p.is_active
        : !p.is_active;
    return matchName && matchFilter;
  });

  const totalPage = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // XỬ LÝ XOÁ SẢN PHẨM
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setLocalProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      if (onDeleteProduct) onDeleteProduct(id);
      // Có thể toast ở đây nếu muốn
    } catch (error) {
      // Có thể toast lỗi ở đây nếu muốn
    }
  };

  // XỬ LÝ SỬA SẢN PHẨM
  const handleEditProduct = (prod) => {
    if (onEditProduct) onEditProduct(prod);
    // Hoặc mở modal form edit tại đây nếu cần
  };

  // XỬ LÝ BẬT/TẮT TRẠNG THÁI
  const handleToggleStatus = async (id, currentActive) => {
    try {
      await lockProduct(id, !currentActive);
      setLocalProducts((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id ? { ...p, is_active: !currentActive } : p
        )
      );
      // Có thể toast ở đây nếu muốn
    } catch (error) {
      // Có thể toast lỗi ở đây nếu muốn
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <ProductControlBar
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onAddProduct={onAddProduct}
      />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[400px] px-4 py-0 rounded-tl-[12px] rounded-bl-[12px] align-middle">Tên sản phẩm</th>
              <th className="w-[126px] px-4 py-0 align-middle">Danh mục</th>
              <th className="w-[126px] px-4 py-0 align-middle">Tồn kho</th>
              <th className="w-[126px] px-4 py-0 align-middle">Lượt bán</th>
              <th className="w-[140px] px-4 py-0 align-middle">Giá</th>
              <th className="w-[96px] px-4 py-0 align-middle">Trạng thái</th>
              <th className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
                <div className="flex items-center justify-end h-[64px]">
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <ProductBody
              products={pageData}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleStatus={handleToggleStatus}
            />
            {totalPage > 1 && (
              <>
                <tr>
                  <td colSpan={7} className="py-2">
                    <div className="w-full h-[1.5px] bg-gray-100 rounded"></div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={7} className="pt-4 pb-2">
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPage={totalPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
