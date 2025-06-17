// OrderTableWrapper.tsx
import { useState, useMemo } from "react";
import OrderControlBar from "./OrderControlBar";
import { Pagination } from "@/admin/layouts/Panigation";
import { Order } from "@/types/order";

export default function OrderTableWrapper({
  orders,
  STATUS,
  children,
}: {
  orders: Order[];
  STATUS: any[];
  children: (
    filtered: Order[],
    pageData: Order[],
    paginProps: { totalPage: number; currentPage: number; Pagination: () => JSX.Element }
  ) => React.ReactNode;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = filter === "all" || order.status === filter;
      const name = order.user?.name || "";
      const email = order.user?.email || "";
      const products = order.products
        ?.map((p) => p.productId?.name)
        .join(", ");
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        products.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const totalPage = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pageData = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="space-y-4 mt-6">
      <OrderControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left h=[64px]">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr>
              <th className="w-[160px] px-4 py-0">Mã đơn hàng</th>
              <th className="w-[380px] px-4 py-0">Sản phẩm</th>
              <th className="w-[200px] px-4 py-0">Người dùng</th>
              <th className="w-[156px] px-4 py-0">Ngày đặt hàng</th>
              <th className="w-[156px] px-4 py-0">Trạng thái</th>
              <th className="w-[56px] px-4 py-0">...</th>
            </tr>
          </thead>
          <tbody>
            {children(filteredOrders, pageData, {
              totalPage,
              currentPage,
              Pagination: () => (
                <Pagination
                  currentPage={currentPage}
                  totalPage={totalPage}
                  onPageChange={handlePageChange}
                />
              ),
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
