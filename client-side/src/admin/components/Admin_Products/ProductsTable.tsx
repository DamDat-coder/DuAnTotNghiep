"use client";
import React, { useState, useEffect } from "react";
import { Pagination } from "../ui/Panigation";
import Image from "next/image";

// Data mẫu
type ProductType = {
  id: string;
  name: string;
  category: string;
  stock: number;
  sold: number;
  price: number;
  status: boolean;
};
const mockProducts: ProductType[] = Array.from({ length: 43 }).map((_, i) => ({
  id: `P${1000 + i}`,
  name: "MLB – Áo khoác phối mũ unisex Gopcore Basic",
  category: "Áo khoác",
  stock: [100, 2, 110, 789, 245, 5, 9, 999][i % 8],
  sold: [1234, 500, 789, 2342, 90, 3456, 4156, 234][i % 8],
  price: 1399000,
  status: i % 3 !== 1, // random mở/tắt
}));

const PAGE_SIZE = 10;

export default function ProductContent() {
  const [products, setProducts] = useState<ProductType[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);

  // Pagination
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Đổi trạng thái
  const handleToggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p))
    );
  };

  // Xoá sản phẩm
  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setActionDropdown(null);
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = () => setActionDropdown(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // Xử lý chuyển trang khi search
  const handleSearch = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };

  // Định dạng số
  const numberFormat = (n: number) => n.toLocaleString("vi-VN");

  return (
    <div className="w-full min-h-screen bg-[#eaf3f8] pt-10 pb-0">
      <div
        className="mx-auto w-[1126px] bg-white rounded-[34px] p-10 shadow"
        style={{ minHeight: 750, display: "flex", flexDirection: "column" }}
      >
        {/* Tiêu đề và search */}
        <div className="flex items-center gap-3 w-full mb-6">
          <select
            className="h-10 px-4 pr-8 rounded-lg bg-[#F6F8FB] border border-[#E6E8EC] text-[#474A57] font-medium focus:outline-none"
            defaultValue=""
            style={{ minWidth: 130 }}
            disabled
          >
            <option>Bán chạy nhất</option>
          </select>
          {/* Tìm kiếm */}
          <div className="relative" style={{ width: 350, maxWidth: "100%" }}>
            <input
              className="w-full h-10 px-4 pr-10 rounded-lg border border-[#E6E8EC] bg-[#F6F8FB] text-base focus:outline-none"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5 text-[#8C94A5] absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="9" cy="9" r="7" stroke="#8C94A5" strokeWidth="2" />
              <path
                d="M16 16L13.5 13.5"
                stroke="#8C94A5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Nút thêm sản phẩm: Giữ nguyên code của bạn */}
          <button
            className="ml-auto h-10 px-5 bg-[#111] text-white font-semibold rounded-lg hover:bg-[#8C94A5] transition justify-between"
            onClick={() => alert("Chức năng Thêm sản phẩm (demo)")}
          >
            <Image
              src="/product/plus.svg"
              alt="plus"
              width={13}
              height={13}
              className="mr-4 inline-block"
            />
            Thêm sản phẩm
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full min-w-[900px] text-base">
            <thead>
              <tr
                className="border-b border-[#F1F1F1] text-[#878B93] font-semibold"
                style={{ background: "#F8FAFC" }}
              >
                <th className="py-3 text-left font-semibold">Tên sản phẩm</th>
                <th className="py-3 text-left font-semibold">Danh mục</th>
                <th className="py-3 text-left font-semibold">Tồn kho</th>
                <th className="py-3 text-left font-semibold">Lượt bán</th>
                <th className="py-3 text-left font-semibold">Giá</th>
                <th className="py-3 text-center font-semibold">Trạng thái</th>
                <th
                  className="py-3 text-center font-semibold"
                  style={{ width: 60 }}
                >
                  ...
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#BDBDBD]">
                    Không tìm thấy sản phẩm phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#F1F1F1] last:border-0"
                  >
                    <td className="py-3 flex items-center gap-2 font-medium">
                      <Image
                        src="/product/product_2.png"
                        alt="sp"
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded object-cover bg-[#f3f3f3]"
                      />
                      {p.name}
                    </td>
                    <td className="py-3">{p.category}</td>
                    <td className="py-3">
                      <span
                        className={
                          p.stock < 10 ? "text-[#F75555] font-bold" : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3">{numberFormat(p.sold)}</td>
                    <td className="py-3">{numberFormat(p.price)}đ</td>
                    {/* Toggle trạng thái */}
                    <td className="py-3 text-center">
                      <button
                        className={`w-12 h-6 rounded-full flex items-center ${
                          p.status ? "bg-[#2998ff]" : "bg-gray-200"
                        } transition`}
                        onClick={() => handleToggleStatus(p.id)}
                        title={p.status ? "Đang bán" : "Ngừng bán"}
                        style={{ padding: 2 }}
                      >
                        <span
                          className={`block h-5 w-5 rounded-full bg-white shadow transition ${
                            p.status ? "translate-x-6" : "translate-x-0"
                          }`}
                          style={{ boxShadow: "0 1px 3px #0002" }}
                        />
                      </button>
                    </td>
                    {/* Action */}
                    <td className="py-3 text-center relative">
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionDropdown(
                            p.id === actionDropdown ? null : p.id
                          );
                        }}
                      >
                        <span className="text-2xl text-[#8C94A5]">⋯</span>
                      </button>
                      {actionDropdown === p.id && (
                        <div
                          className="absolute right-0 top-12 z-50 min-w-[100px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                            onClick={() => {
                              setActionDropdown(null);
                              alert("Chức năng sửa (demo)");
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                            onClick={() => handleDelete(p.id)}
                          >
                            Xoá
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination: đặt dưới bảng, luôn nằm dưới cùng card */}
        {totalPage > 1 && (
          <div className="flex items-center justify-center w-full mt-8 mb-2">
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      {/* Dropdown animation CSS */}
      <style>
        {`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease;
        }
        `}
      </style>
    </div>
  );
}
