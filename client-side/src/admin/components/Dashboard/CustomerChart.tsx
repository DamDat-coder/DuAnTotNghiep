"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { fetchCustomerChart, fetchStats } from "@/services/dashboardApi";

export default function CustomerChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stat, setStat] = useState<{ value: number; change: string }>({ value: 0, change: "" });

  useEffect(() => {
    fetchCustomerChart()
      .then(setData)
      .finally(() => setLoading(false));

    fetchStats().then((stats) => {
      const cus = stats.find((item: any) => item.label === "Khách hàng mới");
      setStat({ value: cus?.value || 0, change: cus?.change || "" });
    });
  }, []);

  return (
    <div className="bg-white w-[359px] h-[284px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500 font-medium">Khách hàng mới</div>
          <div className="text-xl font-extrabold">
            {stat.value}{" "}
            <span className={`text-base font-semibold ${stat.change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
              {stat.change}
            </span>
          </div>
        </div>
        <button className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700">7 ngày qua ▼</button>
      </div>
      <div className="flex items-end h-[180px]">
        {loading ? (
          <div className="text-gray-400 mx-auto text-sm">Đang tải biểu đồ...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" tickLine={false} />
              <YAxis tickLine={false} />
              <Tooltip formatter={(val) => `${val} khách`} labelFormatter={(label) => `Ngày ${label}`} />
              <Bar dataKey="value" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
