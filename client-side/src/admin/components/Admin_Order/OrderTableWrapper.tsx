import { useState, useMemo } from "react";
import { IOrder } from "@/types/order";
import { Pagination } from "../ui/Panigation";
import OrderControlBar from "./OrderControlBar";
import OrderBody from "./OrderBody";
import EditOrderForm from "./OrderEditForm";

export default function OrderTableWrapper({
  orders,
  setOrders,
  STATUS,
}: {
  orders: IOrder[];
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
  STATUS: any[];
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.user?.name || order.userId?.name || "";
      const email = order.user?.email || order.userId?.email || "";
      let products = "";
      if (Array.isArray(order.items) && order.items.length > 0) {
        products = order.items.map((item: any) => item.name).join(", ");
      }
      const matchStatus = filter === "all" || order.status === filter;
      const matchSearch =
        (order._id?.$oid || order._id || order.id || "")
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
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

  function handleChangePage(page: number) {
    setCurrentPage(page);
  }

  function handleEdit(order: IOrder) {
    const orderId = order._id?.$oid || order._id || order.id;
    setEditOrderId(orderId);
  }

  function handleCloseEditForm() {
    setEditOrderId(null);
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
      {editOrderId && (
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
