"use client";
import { useEffect, useState } from "react";
import { User, ShoppingCart, DollarSign, Tag } from "lucide-react";
import { fetchStats } from "@/services/dashboardApi";

interface Stat {
  label: string;
  value: number | string;
  change: string;
}

interface Stat {
  label: string;
  value: number | string;
  change: string;
}

const icons: Record<string, React.ReactElement> = {
  "Khách hàng mới": <User className="w-6 h-6 text-pink-500" />,
  "Đơn hàng": <ShoppingCart className="w-6 h-6 text-yellow-500" />,
  "Doanh thu": <DollarSign className="w-6 h-6 text-blue-500" />,
  "Sản phẩm bán ra": <Tag className="w-6 h-6 text-cyan-500" />,
};

export default function Stats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStats()
      .then((data) => setStats(data || []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-400">Đang tải thống kê...</div>;
  }

  if (!stats.length) {
    return (
      <div className="text-red-500 font-medium">
        Không có dữ liệu thống kê tuần này.
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400">Đang tải thống kê...</div>;
  }

  if (!stats.length) {
    return (
      <div className="text-red-500 font-medium">
        Không có dữ liệu thống kê tuần này.
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white w-[264px] h-[110px] rounded-xl flex flex-col justify-center gap-2 shadow p-5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-full p-2">{icons[s.label] ?? null}</div>
            <div className="font-medium">{s.label}</div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-extrabold">{s.value}</div>
            <span
              className={`text-sm ${
                typeof s.change === "string" && s.change.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {s.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
