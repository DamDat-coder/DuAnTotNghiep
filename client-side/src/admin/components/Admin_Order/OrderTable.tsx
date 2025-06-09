"use client";
import { useState } from "react";

// Định nghĩa trạng thái đơn hàng và màu sắc tương ứng
const STATUS = [
  {
    key: "processing",
    label: "Đang xử lý",
    color: "bg-[#E8F2FD] text-[#2998FF]",
  },
  {
    key: "confirming",
    label: "Chờ xác nhận",
    color: "bg-[#FFF7DB] text-[#FFA800]",
  },
  {
    key: "delivering",
    label: "Đang giao",
    color: "bg-[#DBF7E8] text-[#39C24F]",
  },
  {
    key: "completed",
    label: "Đã hoàn thành",
    color: "bg-[#DBF7E8] text-[#449E3C]",
  },
  { key: "cancelled", label: "Đã huỷ", color: "bg-[#FFE1E1] text-[#F75555]" },
];

// Tạo dữ liệu mẫu (27 orders)
const customers = [
  "Robert Fox",
  "Brooklyn Simmons",
  "Jacob Jones",
  "Marvin McKinney",
  "Arlene McCoy",
  "Esther Howard",
  "Darrell Steward",
  "Bessie Cooper",
  "Ralph Edwards",
  "Dianne Russell",
  "Guy Hawkins",
  "Jenny Wilson",
  "Eleanor Pena",
  "Wade Warren",
  "Ronald Richards",
  "Courtney Henry",
  "Cody Fisher",
  "Cameron Williamson",
  "Leslie Alexander",
  "Jane Cooper",
  "Floyd Miles",
  "Annette Black",
  "Theresa Webb",
  "Savannah Nguyen",
  "Jerome Bell",
  "Devon Lane",
  "Kathryn Murphy",
];
const products = [
  "MLB – Áo khoác phối mũ unisex Gopcore Basic",
  "MLB – Áo khoác Gopcore Basic",
  "MLB – Áo hoodie unisex Essential",
  "MLB – Áo bomber unisex Classic",
];
const randomStatus = () =>
  STATUS[Math.floor(Math.random() * STATUS.length)].key;
const randomDate = () => {
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  return `${day}.${month}.2025`;
};
const mockOrders = Array.from({ length: 27 }).map((_, idx) => ({
  id: `ODR${1000 + idx}`,
  product: products[idx % products.length],
  customer: customers[idx % customers.length],
  date: randomDate(),
  status: randomStatus(),
}));

const getStatusInfo = (key: string) => STATUS.find((s) => s.key === key)!;
const getNextStatus = (key: string) => {
  const idx = STATUS.findIndex((s) => s.key === key);
  return STATUS[(idx + 1) % STATUS.length].key;
};

const PAGE_SIZE = 10;

export default function OrderContent() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc dữ liệu
  const filtered = orders.filter(
    (o) =>
      (filterStatus === "all" || o.status === filterStatus) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.product.toLowerCase().includes(search.toLowerCase()))
  );

  // Phân trang
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Đổi trạng thái
  const handleChangeStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status: getNextStatus(order.status) }
          : order
      )
    );
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

  return (
    <div className="w-full min-h-screen bg-[#eaf3f8] pt-10">
      <div
        className="mx-auto w-[1126px] bg-white rounded-[34px] p-10 shadow relative"
        style={{ minHeight: 750 }}
      >
        {/* Tiêu đề & search */}
        <div className="flex items-center gap-3 w-full mb-6">
          <div>
            <select
              className="h-10 px-4 pr-8 rounded-lg bg-[#F6F8FB] border border-[#E6E8EC] text-[#474A57] font-medium focus:outline-none"
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              style={{ minWidth: 90 }}
            >
              <option value="all">Tất cả</option>
              {STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <input
              className="w-full h-10 px-4 pr-10 rounded-lg border border-[#E6E8EC] bg-[#F6F8FB] text-base focus:outline-none"
              placeholder="Tìm kiếm"
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
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-[30px]">
          <table className="w-full min-w-[900px] text-base">
            <thead>
              <tr className="border-b border-[#F1F1F1] text-[#878B93] font-semibold">
                <th className="py-3 text-left font-semibold">Order ID</th>
                <th className="py-3 text-left font-semibold">Product</th>
                <th className="py-3 text-left font-semibold">Customer</th>
                <th className="py-3 text-left font-semibold">Date</th>
                <th className="py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#BDBDBD]">
                    Không tìm thấy đơn hàng phù hợp
                  </td>
                </tr>
              ) : (
                pageData.map((order) => {
                  const s = getStatusInfo(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#F1F1F1] last:border-0"
                    >
                      <td className="py-3 font-semibold text-[#202020]">
                        {order.id}
                      </td>
                      <td className="py-3">{order.product}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 font-semibold text-[#212121]">
                        {order.date}
                      </td>
                      <td className="py-3">
                        <button
                          className={`px-4 py-1 rounded-[8px] font-medium min-w-[120px] text-sm ${s.color} border-0 outline-none transition hover:scale-105`}
                          onClick={() => handleChangeStatus(order.id)}
                          title="Click để đổi trạng thái"
                        >
                          {s.label}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination: luôn ở đáy card */}
        {totalPage > 1 && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center gap-2"
            style={{ bottom: 40 }}
          >
            <button
              className="px-3 py-1 rounded hover:bg-gray-100 text-xl"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPage }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(idx + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-semibold 
                  ${
                    currentPage === idx + 1
                      ? "bg-[#2998FF] text-white"
                      : "text-[#222] hover:bg-gray-100"
                  }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded hover:bg-gray-100 text-xl"
              disabled={currentPage === totalPage}
              onClick={() => goToPage(currentPage + 1)}
            >
              {">"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
