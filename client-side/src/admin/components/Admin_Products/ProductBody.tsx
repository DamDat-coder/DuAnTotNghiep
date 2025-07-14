"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { deleteProduct } from "@/services/productApi";
import { toast } from "react-hot-toast";

export default function ProductBody({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Xử lý xóa
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        if (onDelete) onDelete(id);
        toast.success("Đã xóa sản phẩm!");
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi xóa sản phẩm!");
      }
    }
  };

  // Sửa
  const handleEdit = (product: any) => {
    if (onEdit) onEdit(product);
  };

  // Bật/Tắt trạng thái: Luôn hỏi xác nhận!
  const handleToggleClick = (id: string) => {
    setConfirmId(id);
  };

  // Xác nhận Có
  const handleConfirm = (id: string, currentActive: boolean) => {
    setConfirmId(null);
    onToggleStatus?.(id, currentActive);
  };

  // Không
  const handleCancel = () => setConfirmId(null);

  // Đóng dropdown khi click ra ngoài
  const popupRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const calcTotalStock = (variants: any[]) =>
    Array.isArray(variants) ? variants.reduce((s, v) => s + (v.stock || 0), 0) : "--";
  const getFirstPrice = (variants: any[]) =>
    Array.isArray(variants) && variants[0] && variants[0].price
      ? variants[0].price.toLocaleString("vi-VN") + "đ"
      : "--";

  return (
    <>
      {products.map(product => {
        const productId = product.id || product._id;
        const isActive = product.is_active ?? true;
        return (
          <tr
            key={productId}
            className="border-b hover:bg-[#F9FAFB] transition-colors duration-150 group"
          >
            {/* Tên sản phẩm + ảnh */}
            <td className="px-4 py-4 min-w-[270px] max-w-[350px] align-middle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg overflow-hidden bg-[#f3f3f3] flex items-center justify-center">
                  <Image
                    src={
                      product.images && product.images[0]
                        ? (product.images[0].startsWith("http")
                            ? product.images[0]
                            : `/product/img/${product.images[0]}`)
                        : "/no-image.png"
                    }
                    width={40}
                    height={40}
                    alt={product.name || "No image"}
                    className="object-cover w-10 h-10"
                  />
                </div>
                <span className="font-semibold text-[#202020] text-base whitespace-pre-line break-words leading-6">
                  {product.name || "Không có dữ liệu"}
                </span>
              </div>
            </td>
            {/* Danh mục */}
            <td className="px-4 py-4 min-w-[110px] align-middle text-gray-700">
              {product.category?.name || "Không có dữ liệu"}
            </td>
            {/* Tồn kho */}
            <td className="px-4 py-4 min-w-[70px] align-middle">
              <span className={calcTotalStock(product.variants) <= 10 ? "text-pink-500 font-semibold" : ""}>
                {calcTotalStock(product.variants)}
              </span>
            </td>
            {/* Lượt bán */}
            <td className="px-4 py-4 min-w-[70px] align-middle">
              <span className="font-medium text-gray-800">
                {typeof product.salesCount === "number" ? product.salesCount : 0}
              </span>
            </td>
            {/* Giá */}
            <td className="px-4 py-4 min-w-[110px] align-middle font-semibold">
              {getFirstPrice(product.variants)}
            </td>
            {/* Trạng thái */}
            <td className="px-4 py-4 min-w-[100px] align-middle">
              <button
                className={`w-10 h-6 rounded-full transition relative ${
                  isActive ? "bg-[#2563EB]" : "bg-gray-300"
                }`}
                onClick={() => handleToggleClick(productId)}
                tabIndex={-1}
              >
                <span
                  className={`absolute left-0 top-0 transition-all duration-200 w-6 h-6 bg-white rounded-full shadow ${
                    isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              {/* Popup xác nhận (bật/tắt đều hỏi) */}
              {confirmId === productId && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[1000]">
                  <div className="bg-white rounded-xl p-6 w-[320px] shadow-xl flex flex-col items-center gap-4">
                    <div className="text-lg font-semibold text-center">
                      {isActive
                        ? "Bạn có chắc muốn khóa sản phẩm này?"
                        : "Bạn có chắc muốn mở khóa và hiển thị sản phẩm này?"}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button
                        className="px-4 py-2 rounded bg-[#2563EB] text-white font-semibold hover:bg-[#174bb7]"
                        onClick={() => handleConfirm(productId, isActive)}
                      >
                        Có
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-gray-200 text-black font-semibold hover:bg-gray-300"
                        onClick={handleCancel}
                      >
                        Không
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </td>
            {/* Ba chấm - Dropdown action */}
            <th className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
              <div className="flex items-center justify-end h-[64px]">
                <button
                  className="focus:outline-none"
                  onClick={e => {
                    e.stopPropagation();
                    setActionDropdownId(actionDropdownId === productId ? null : productId);
                  }}
                >
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </button>
                {/* Dropdown */}
                {actionDropdownId === productId && (
                  <div
                    ref={popupRef}
                    className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                      onClick={() => {
                        setActionDropdownId(null);
                        handleEdit(product);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                      onClick={() => {
                        setActionDropdownId(null);
                        handleDelete(productId);
                      }}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            </th>
          </tr>
        );
      })}
    </>
  );
}
