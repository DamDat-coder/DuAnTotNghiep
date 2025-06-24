import { useState, useMemo } from "react";
import OrderControlBar from "./OrderControlBar";
import { Order } from "@/types/order";
import { Pagination } from "../ui/Panigation";
import OrderBody from "./OrderBody";

export default function OrderTableWrapper({
  orders,
  STATUS,
}: {
  orders: Order[];
  STATUS: any[];
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.user?.name || "";
      const email = order.user?.email || "";
      const products = order.products?.map((p) => p.productId?.name).join(", ") || "";
      const matchStatus = filter === "all" || order.status === filter;
      const matchSearch =
        (order.id || "").toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        products.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const totalPage = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pageData = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="space-y-4 mt-6">
      <OrderControlBar
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        STATUS={STATUS} // Truyền từ props của OrderTableWrapper
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
            <OrderBody orders={pageData} STATUS={STATUS} />
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
