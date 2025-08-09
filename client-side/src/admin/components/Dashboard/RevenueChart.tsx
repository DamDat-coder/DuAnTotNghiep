"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { fetchAllOrders } from "@/services/orderApi";

interface RevenueChartData {
  label: string;
  orders: number;
  revenue: number;
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = cả năm
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Lấy toàn bộ orders, xác định năm có đơn hàng delivered
  useEffect(() => {
    setLoading(true);
    fetchAllOrders({ limit: 9999 }).then(res => {
      const orders = res.data || [];
      setOrders(orders);

      // Tìm các năm có đơn hàng delivered
      const yearsSet = new Set<number>();
      orders.forEach(order => {
        if (order.createdAt && order.status === "delivered") {
          yearsSet.add(new Date(order.createdAt).getFullYear());
        }
      });
      const yearsArr = Array.from(yearsSet).sort((a, b) => b - a);
      setAvailableYears(yearsArr);

      // Nếu năm hiện tại không có đơn thì chọn năm lớn nhất
      if (!yearsSet.has(selectedYear) && yearsArr.length > 0) {
        setSelectedYear(yearsArr[0]);
      }
      setLoading(false);
    });
    // eslint-disable-next-line
  }, []);

  // Khi thay đổi năm/tháng, cập nhật dữ liệu biểu đồ
  useEffect(() => {
    if (!orders.length) return;

    setLoading(true);

    // Lọc order delivered đúng năm/tháng
    const filteredOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const date = new Date(order.createdAt);
      return (
        order.status === "delivered" &&
        date.getFullYear() === selectedYear &&
        (selectedMonth === 0 || date.getMonth() + 1 === selectedMonth)
      );
    });

    let result: RevenueChartData[] = [];
    if (selectedMonth === 0) {
      // Hiển thị theo tháng của năm đã chọn
      const monthMap = new Map<number, { count: number; revenue: number }>();
      for (let i = 1; i <= 12; i++) {
        monthMap.set(i, { count: 0, revenue: 0 });
      }
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt);
        const month = date.getMonth() + 1;
        const revenue = order.total || order.totalPrice || 0;
        const entry = monthMap.get(month)!;
        entry.count += 1;
        entry.revenue += revenue;
      });
      result = Array.from(monthMap.entries()).map(([month, { count, revenue }]) => ({
        label: `Tháng ${month}`,
        orders: count,
        revenue,
      }));
    } else {
      // Hiển thị từng ngày trong tháng đã chọn của năm đã chọn
      const dayInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dayMap = new Map<number, { count: number; revenue: number }>();
      for (let i = 1; i <= dayInMonth; i++) {
        dayMap.set(i, { count: 0, revenue: 0 });
      }
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt);
        const day = date.getDate();
        const revenue = order.total || order.totalPrice || 0;
        const entry = dayMap.get(day)!;
        entry.count += 1;
        entry.revenue += revenue;
      });
      result = Array.from(dayMap.entries()).map(([day, { count, revenue }]) => ({
        label: `${day}/${selectedMonth}`,
        orders: count,
        revenue,
      }));
    }

    setData(result);
    setTotalOrders(result.reduce((sum, item) => sum + item.orders, 0));
    setTotalRevenue(result.reduce((sum, item) => sum + item.revenue, 0));
    setLoading(false);
    // eslint-disable-next-line
  }, [orders, selectedYear, selectedMonth]);

  return (
    <div className="bg-white w-full h-[360px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500 font-medium">Tổng đơn hàng & Doanh thu</div>
          <div className="text-[22px] font-extrabold mb-1">
            {totalOrders.toLocaleString()} đơn ·{" "}
            {totalRevenue.toLocaleString("vi-VN")} VNĐ
          </div>
        </div>
        <div className="flex gap-2">
          {/* Bộ lọc năm */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {/* Bộ lọc tháng */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700"
          >
            <option value={0}>Cả năm</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            allowDecimals={false}
            domain={[0, 'auto']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(val) => `${Math.round(Number(val) / 1e6)} tr`}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(val, name) => {
              if (name === "Doanh thu") {
                return [`${Number(val).toLocaleString("vi-VN")}`, "Doanh thu"];
              }
              return [`${val} đơn`, "Số đơn"];
            }}
            labelFormatter={(label) =>
              selectedMonth === 0
                ? label
                : `Ngày ${label}`
            }
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="orders"
            name="Số đơn"
            stroke="#4F8CFF"
            strokeWidth={3}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#22C55E"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {loading && <div className="text-gray-400 text-center mt-3">Đang tải dữ liệu...</div>}
    </div>
  );
}
