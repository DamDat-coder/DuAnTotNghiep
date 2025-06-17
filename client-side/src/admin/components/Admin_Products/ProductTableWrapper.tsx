// src/admin/components/Admin_Product/ProductTableWrapper.tsx
"use client";
import { useEffect, useState } from "react";
import ProductControlBar from "./ProductControlBar";
import ProductBody from "./ProductBody";
import Image from "next/image";
import { Pagination } from "../ui/Panigation";

export default function ProductTableWrapper({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  const [localProducts, setLocalProducts] = useState(
    (Array.isArray(products) ? products : []).map((p) => ({
      ...p,
      active: typeof p.is_active === "boolean" ? p.is_active : true,
    }))
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    setLocalProducts(
      (Array.isArray(products) ? products : []).map((p) => ({
        ...p,
        active: typeof p.is_active === "boolean" ? p.is_active : true,
      }))
    );
  }, [products]);

  // Filter + search
  const filtered = localProducts.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? p.active
        : !p.active;
    return matchName && matchFilter;
  });

  const totalPage = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleStatus = (id: string) => {
    setLocalProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, active: !p.active } : p))
    );
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
              <th className="w-[400px] px-4 py-0 rounded-tl-[12px] rounded-bl-[12px]">Tên sản phẩm</th>
              <th className="w-[126px] px-4 py-0">Danh mục</th>
              <th className="w-[126px] px-4 py-0">Tồn kho</th>
              <th className="w-[126px] px-4 py-0">Lượt bán</th>
              <th className="w-[140px] px-4 py-0">Giá</th>
              <th className="w-[96px] px-4 py-0">Trạng thái</th>
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
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleStatus={handleToggleStatus}
            />
          </tbody>
        </table>
      </div>
      {totalPage > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
