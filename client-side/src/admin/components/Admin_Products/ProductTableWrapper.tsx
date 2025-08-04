"use client";
import { useEffect, useState } from "react";
import ProductControlBar from "./ProductControlBar";
import ProductBody from "./ProductBody";
import Image from "next/image";
import { Pagination } from "../ui/Panigation";
import { lockProduct, deleteProduct } from "@/services/productApi";
import { toast } from "react-hot-toast";
import { IProduct } from "@/types/product";

interface ProductTableWrapperProps {
  products: IProduct[];
  onAddProduct: () => void;
  onEditProduct: (prod: IProduct) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductTableWrapper({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductTableWrapperProps) {
  const [localProducts, setLocalProducts] = useState<IProduct[]>(
    Array.isArray(products) ? products : []
  );
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageSize = 10;

  useEffect(() => {
    setLocalProducts(Array.isArray(products) ? products : []);
  }, [products]);

  // Hàm tính tổng tồn kho của các variants
  const calcTotalStock = (variants: IProduct["variants"] = []) =>
    Array.isArray(variants) ? variants.reduce((s, v) => s + (v.stock || 0), 0) : 0;

  // Lọc sản phẩm theo search và filter
  const filtered = localProducts.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter === "active") matchFilter = p.is_active;
    else if (filter === "inactive") matchFilter = !p.is_active;
    else if (filter === "low_stock") matchFilter = calcTotalStock(p.variants) <= 30;
    // "all" thì giữ nguyên
    return matchName && matchFilter;
  });

  const totalPage = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setLocalProducts((prev) => prev.filter((p) => (p.id || (p as any)._id) !== id));
      if (onDeleteProduct) onDeleteProduct(id);
      toast.success("Đã xóa sản phẩm!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Lỗi khi xóa sản phẩm!");
      } else {
        toast.error("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  // Xử lý sửa sản phẩm
  const handleEditProduct = (prod: IProduct) => {
    if (onEditProduct) onEditProduct(prod);
  };

  // Xử lý bật/tắt trạng thái (từ ProductBody gọi sang)
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    setLocalProducts((prev) =>
      prev.map((p) =>
        (p.id || (p as any)._id) === id ? { ...p, is_active: !currentActive } : p
      )
    );
    try {
      await lockProduct(id, !currentActive);
      if (!currentActive) {
        toast.success("Sản phẩm đã được mở khóa và hiển thị!");
      } else {
        toast.success("Đã khóa sản phẩm thành công!");
      }
    } catch (error: unknown) {
      setLocalProducts((prev) =>
        prev.map((p) =>
          (p.id || (p as any)._id) === id ? { ...p, is_active: currentActive } : p
        )
      );
      if (error instanceof Error) {
        toast.error(
          !currentActive
            ? "Lỗi khi mở khóa sản phẩm!"
            : "Lỗi khi khóa sản phẩm!"
        );
      } else {
        toast.error("Lỗi khi cập nhật trạng thái sản phẩm!");
      }
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
              <th className="w-[126px] px-4 py-0 align-middle">Số lượng bán</th>
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
