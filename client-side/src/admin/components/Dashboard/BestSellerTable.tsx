import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchAllOrders, getBestSellingProductsFromOrders } from "@/services/orderApi";
import type { IOrder } from "@/types/order";

export default function BestSellerTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    setLoading(true);
    fetchAllOrders({ limit: 9999 })
      .then((res) => {
        const best = getBestSellingProductsFromOrders(res.data as IOrder[], timeRange, 5);
        setData(best);
      })
      .finally(() => setLoading(false));
  }, [timeRange]);

  return (
    <div className="bg-white w-full rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-lg">Bán chạy nhất</div>
        <select
          className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 bg-white hover:border-gray-400"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "today" | "week" | "month")}
        >
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày gần nhất</option>
          <option value="month">30 ngày gần nhất</option>
        </select>
      </div>
      <table className="w-full text-left table-auto">
        <thead className="text-sm text-gray-500 border-b">
          <tr>
            <th className="py-2 px-2 font-semibold text-left w-1/3">Tên sản phẩm</th>
            <th className="py-2 px-2 font-semibold text-center">Màu</th>
            <th className="py-2 px-2 font-semibold text-center">Size</th>
            <th className="py-2 px-2 font-semibold text-center">Lượt bán</th>
            <th className="py-2 px-2 font-semibold text-right">Giá</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-400">
                Đang tải...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-400">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id + item.color + item.size}
                className="border-b last:border-b-0 hover:bg-gray-50 text-base"
              >
                <td className="py-2 px-2 flex items-center gap-2 font-medium truncate max-w-[400px] align-middle">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    <Image
                      src={item.image || "/no-image.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <span>{item.name}</span>
                </td>
                <td className="py-2 px-2 text-center align-middle">{item.color}</td>
                <td className="py-2 px-2 text-center align-middle">{item.size}</td>
                <td className="py-2 px-2 text-center align-middle">
                  {item.sold.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-semibold align-middle">
                  {item.price.toLocaleString()}₫
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
