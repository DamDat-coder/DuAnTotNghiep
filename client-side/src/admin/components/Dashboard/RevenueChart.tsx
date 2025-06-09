"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Tháng 1", revenue: 20000000 },
  { month: "Tháng 2", revenue: 40567000 },
  { month: "Tháng 3", revenue: 18000000 },
  { month: "Tháng 4", revenue: 36000000 },
  { month: "Tháng 5", revenue: 29000000 },
  { month: "Tháng 6", revenue: 26000000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white w-[743px] h-[284px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500 font-medium">Tổng doanh thu</div>
          <div className="text-[22px] font-extrabold mb-1">120.234.000đ <span className="text-green-500 text-base font-semibold">+35%</span></div>
        </div>
        <button className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700">Trong năm ▼</button>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="month" tickLine={false} />
          <YAxis domain={[10000000, 50000000]} tickFormatter={val => `${val/1e6}tr`} tickLine={false} />
          <Tooltip formatter={val => `${val.toLocaleString()}đ`} />
          <Line type="monotone" dataKey="revenue" stroke="#4F8CFF" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
