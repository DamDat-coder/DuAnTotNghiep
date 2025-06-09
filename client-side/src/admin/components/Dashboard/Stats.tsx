import { User, ShoppingCart, DollarSign, Tag } from "lucide-react";

const stats = [
  { icon: <User className="w-6 h-6 text-pink-500" />, label: "Khách hàng mới", value: 85, change: "-5%" },
  { icon: <ShoppingCart className="w-6 h-6 text-yellow-500" />, label: "Đơn hàng", value: 123, change: "+12%" },
  { icon: <DollarSign className="w-6 h-6 text-blue-500" />, label: "Doanh thu", value: "12.234.000đ", change: "+35%" },
  { icon: <Tag className="w-6 h-6 text-cyan-500" />, label: "Sản phẩm bán ra", value: "55.566", change: "+15%" },
];

export default function Stats() {
  return (
    <div className="flex gap-6">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white w-[264px] h-[110px] rounded-xl flex flex-col justify-center gap-2 shadow p-5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-full p-2">{s.icon}</div>
            <div className="font-medium">{s.label}</div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-extrabold">{s.value}</div>
            <span
              className={`text-sm ${s.change.startsWith("-") ? "text-red-500" : "text-green-500"}`}
            >
              {s.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
