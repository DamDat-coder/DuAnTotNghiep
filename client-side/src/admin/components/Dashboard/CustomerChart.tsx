"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchCustomerChart, fetchStats } from "@/services/dashboardApi";

interface CustomerChartItem {
  label: string; // "T2", "T3", ..., "CN"
  value: number;
}

const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function CustomerChart() {
  const [data, setData] = useState<CustomerChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stat, setStat] = useState<{ value: number; change: string }>({
    value: 0,
    change: "",
  });

  // Map dữ liệu về dạng label là thứ
  const formatChartData = (rawData: { day: string; value: number }[]) => {
    // rawData luôn đủ 7 ngày, thứ tự từ thứ 2 đến CN
    return rawData.map((item, idx) => ({
      label: weekdayLabels[idx], // "T2"..."CN"
      value: item.value,
    }));
  };

  useEffect(() => {
    setLoading(true);
    fetchCustomerChart()
      .then((raw) => setData(formatChartData(raw)))
      .finally(() => setLoading(false));

    fetchStats().then((stats) => {
      const cus = stats.find((item: any) => item.label === "Khách hàng mới");
      setStat({ value: cus?.value || 0, change: cus?.change || "" });
    });
  }, []);

  return (
    <div className="bg-white w-[359px] h-[360px] rounded-xl p-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm text-gray-500 font-medium mb-1">
            Khách hàng mới
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stat.value}{" "}
            <span
              className={`text-sm font-medium ${
                typeof stat.change === "string" && stat.change.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {stat.change}
            </span>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700">
          Trong tuần
        </div>
      </div>

      <div className="flex justify-center items-center h-[240px]">
        {loading ? (
          <div className="text-gray-400 text-sm">Đang tải biểu đồ...</div>
        ) : !data.length ? (
          <div className="text-red-500 text-center w-full">
            Không có dữ liệu khách hàng mới tuần này.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -16, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label" // Trục X là T2, T3, ..., CN
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val) => `${val} khách`}
                labelFormatter={(label) => `Thứ: ${label}`}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#3B82F6"
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
