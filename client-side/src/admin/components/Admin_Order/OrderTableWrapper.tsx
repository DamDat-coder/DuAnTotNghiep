"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IOrder } from "@/types/order";
import { Pagination } from "../ui/Panigation";
import OrderControlBar from "./OrderControlBar";
import OrderBody from "./OrderBody";
import dynamic from "next/dynamic";

// Load EditOrderForm chỉ khi cần
const EditOrderForm = dynamic(() => import("./OrderEditForm"), { ssr: false });

interface OrderTableWrapperProps {
  orders: IOrder[];
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
  STATUS: { key: IOrder["status"]; label: string; color: string }[];
}

export default function OrderTableWrapper({
  orders,
  setOrders,
  STATUS,
}: OrderTableWrapperProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const searchParams = useSearchParams();
  const router = useRouter();

  const editOrderId = searchParams.get("edit");

  const PAGE_SIZE = 10;

  // --- Lọc/ Tìm kiếm ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tìm theo orderCode, _id, note
      const keyword =
        (order.orderCode || "") +
        " " +
        (order._id || "") +
        " " +
        (order.note || "");
      // Tìm theo tên sản phẩm
      const products = order.items?.map((item) => item.name).join(", ") || "";

      const matchStatus = filter === "all" || order.status === filter;
      const matchSearch =
        keyword.toLowerCase().includes(search.toLowerCase()) ||
        products.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const totalPage = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pageData = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [filteredOrders, currentPage]
  );

  // --- Đổi trang ---
  function handleChangePage(page: number) {
    setCurrentPage(page);
  }

  // --- Sửa đơn ---
  function handleEdit(order: IOrder) {
    const orderId = order._id;
    const params = new URLSearchParams(window.location.search);
    params.set("edit", orderId);
    router.push(`/admin/order?${params.toString()}`);
  }

  // --- Đóng popup edit ---
  function handleCloseEditForm() {
    const params = new URLSearchParams(window.location.search);
    params.delete("edit");
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    router.replace(newUrl);
  }

  return (
    <div className="mt-6">
      <OrderControlBar
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        STATUS={STATUS}
      />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr>
              <th className="w-[130px] h-[64px] align-middle px-4 py-0">Mã đơn hàng</th>
              <th className="w-[380px] h-[64px] align-middle px-4 py-0">Sản phẩm</th>
              <th className="w-[200px] h-[64px] align-middle px-4 py-0">Người dùng</th>
              <th className="w-[156px] h-[64px] align-middle px-4 py-0">Ngày đặt hàng</th>
              <th className="w-[156px] h-[64px] align-middle px-4 py-0">Trạng thái</th>
              <th className="w-[56px] h-[64px] align-middle px-4 py-0">...</th>
            </tr>
          </thead>
          <tbody>
            <OrderBody
              orders={pageData}
              setOrders={setOrders}
              STATUS={STATUS}
              onEdit={handleEdit}
            />
          </tbody>
        </table>
        {totalPage > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={handleChangePage}
            />
          </div>
        )}
      </div>

      {!!editOrderId && (
        <EditOrderForm
          orderId={editOrderId}
          onClose={handleCloseEditForm}
          setOrders={setOrders}
          STATUS={STATUS}
        />
      )}
    </div>
  );
}
