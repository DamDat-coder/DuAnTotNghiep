"use client";
import React, { useState, useEffect } from "react";
import { Pagination } from "@/admin/layouts/Panigation";

const STATUS = [
  { key: "processing", label: "Đang xử lý", color: "bg-[#E8F2FD] text-[#2998FF]" },
  { key: "confirming", label: "Chờ xác nhận", color: "bg-[#FFF7DB] text-[#FFA800]" },
  { key: "delivering", label: "Đang giao", color: "bg-[#DBF7E8] text-[#39C24F]" },
  { key: "completed", label: "Đã hoàn thành", color: "bg-[#DBF7E8] text-[#449E3C]" },
  { key: "cancelled", label: "Đã huỷ", color: "bg-[#FFE1E1] text-[#F75555]" },
];

const customers = [
  "Robert Fox", "Brooklyn Simmons", "Jacob Jones", "Marvin McKinney", "Arlene McCoy",
  "Esther Howard", "Darrell Steward", "Bessie Cooper", "Ralph Edwards", "Dianne Russell",
  "Guy Hawkins", "Jenny Wilson", "Eleanor Pena", "Wade Warren", "Ronald Richards",
  "Courtney Henry", "Cody Fisher", "Cameron Williamson", "Leslie Alexander", "Jane Cooper",
  "Floyd Miles", "Annette Black", "Theresa Webb", "Savannah Nguyen", "Jerome Bell",
  "Devon Lane", "Kathryn Murphy"
];
const products = [
  "MLB – Áo khoác phối mũ unisex Gopcore Basic",
  "MLB – Áo khoác Gopcore Basic",
  "MLB – Áo hoodie unisex Essential",
  "MLB – Áo bomber unisex Classic",
];
const randomStatus = () => STATUS[Math.floor(Math.random() * STATUS.length)].key;
const randomDate = () => {
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  return `${day}.${month}.2025`;
};
type OrderType = {
  id: string;
  product: string;
  customer: string;
  date: string;
  status: string;
};
const mockOrders: OrderType[] = Array.from({ length: 27 }).map((_, idx) => ({
  id: `ODR${1000 + idx}`,
  product: products[idx % products.length],
  customer: customers[idx % customers.length],
  date: randomDate(),
  status: randomStatus(),
}));

const getStatusInfo = (key: string) => STATUS.find((s) => s.key === key)!;
const PAGE_SIZE = 10;

export default function OrderContent() {
  const [search, setSearch] = useState<string>("");
  const [orders, setOrders] = useState<OrderType[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);

  // Lọc dữ liệu
  const filtered = orders.filter(
    (o) =>
      (filterStatus === "all" || o.status === filterStatus) &&
      (
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.product.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Phân trang
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Đổi trạng thái
  const handleChangeStatus = (id: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: nextStatus } : order
      )
    );
    setStatusDropdown(null);
  };

  // Chuyển trang
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPage) return;
    setCurrentPage(page);
  };

  // Reset về trang 1 khi lọc/search
  const handleFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };
  const handleSearch = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };

  // Xoá đơn hàng
  const handleDeleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    setActionDropdown(null);
  };

  // Click ngoài để đóng dropdown
  useEffect(() => {
    const handler = () => {
      setStatusDropdown(null);
      setActionDropdown(null);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#eaf3f8] pt-10">
      <div
        className="mx-auto w-[1126px] bg-white rounded-[34px] p-10 shadow flex flex-col"
        style={{ minHeight: 750 }}
      >
        {/* Tiêu đề & search */}
        <div className="flex items-center gap-3 w-full mb-6">
          <div>
            <select
              className="h-10 px-4 pr-8 rounded-lg bg-[#F6F8FB] border border-[#E6E8EC] text-[#474A57] font-medium focus:outline-none"
              value={filterStatus}
              onChange={e => handleFilter(e.target.value)}
              style={{ minWidth: 90 }}
            >
              <option value="all">Tất cả</option>
              {STATUS.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          {/* Thanh tìm kiếm giới hạn 350px */}
          <div className="relative" style={{ width: 350, maxWidth: "100%" }}>
            <input
              className="w-full h-10 px-4 pr-10 rounded-lg border border-[#E6E8EC] bg-[#F6F8FB] text-base focus:outline-none"
              placeholder="Tìm kiếm"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5 text-[#8C94A5] absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="9" cy="9" r="7" stroke="#8C94A5" strokeWidth="2" />
              <path d="M16 16L13.5 13.5" stroke="#8C94A5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-[30px] flex-1">
          <table className="w-full min-w-[900px] text-base">
            <thead>
              <tr className="border-b border-[#F1F1F1] text-[#878B93] font-semibold">
                <th className="py-3 text-left font-semibold">Mã đơn hàng</th>
                <th className="py-3 text-left font-semibold">Sản phẩm</th>
                <th className="py-3 text-left font-semibold">Người dùng</th>
                <th className="py-3 text-left font-semibold">Ngày đặt hàng</th>
                <th className="py-3 text-left font-semibold">Trạng thái</th>
                <th className="py-3 text-center font-semibold" style={{ width: 60 }}>...</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#BDBDBD]">
                    Không tìm thấy đơn hàng phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((order) => {
                  const s = getStatusInfo(order.status);
                  const currentIdx = STATUS.findIndex(item => item.key === order.status);
                  const nextStatusList = STATUS.slice(currentIdx + 1);
                  return (
                    <tr key={order.id} className="border-b border-[#F1F1F1] last:border-0 relative group">
                      <td className="py-3 font-semibold text-[#202020]">{order.id}</td>
                      <td className="py-3">{order.product}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 font-semibold text-[#212121]">{order.date}</td>
                      <td className="py-3">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            className={`px-4 py-1 rounded-[8px] font-medium min-w-[120px] text-sm ${s.color} border-0 outline-none transition hover:scale-105 flex items-center`}
                            onClick={e => {
                              e.stopPropagation();
                              setStatusDropdown(order.id === statusDropdown ? null : order.id);
                            }}
                          >
                            {s.label}
                            <span className="ml-1 text-[#bdbdbd]">▼</span>
                          </button>
                          {statusDropdown === order.id && nextStatusList.length > 0 && (
                            <div
                              className="absolute left-0 mt-2 min-w-[150px] rounded-lg shadow bg-white z-50 border border-gray-100 animate-fadeIn"
                              onClick={e => e.stopPropagation()}
                            >
                              {nextStatusList.map(item => (
                                <button
                                  key={item.key}
                                  onClick={() => handleChangeStatus(order.id, item.key)}
                                  className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${item.color}`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Dấu ba chấm ngang */}
                      <td className="py-3 text-center relative">
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                          onClick={e => {
                            e.stopPropagation();
                            setActionDropdown(order.id === actionDropdown ? null : order.id);
                          }}
                        >
                          <span className="text-2xl text-[#8C94A5]">⋯</span>
                        </button>
                        {actionDropdown === order.id && (
                          <div
                            className="absolute right-0 top-12 z-50 min-w-[100px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                              onClick={() => { setActionDropdown(null); alert("Chức năng sửa (demo)"); }}
                            >Sửa</button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                              onClick={() => handleDeleteOrder(order.id)}
                            >Xoá</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination (component riêng) */}
        {totalPage > 1 && (
          <div className="flex items-center justify-center w-full mt-8">
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>
      {/* CSS animation for dropdown */}
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
