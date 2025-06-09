"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "S", value: 8 },
  { day: "M", value: 14 },
  { day: "T", value: 12 },
  { day: "W", value: 20 },
  { day: "T", value: 18 },
  { day: "F", value: 23 },
  { day: "S", value: 21 },
];

export default function CustomerChart() {
  return (
    <div className="bg-white w-[359px] h-[284px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500 font-medium">Khách hàng mới</div>
          <div className="text-xl font-extrabold">85 <span className="text-red-500 text-base font-semibold">-5%</span></div>
        </div>
        <button className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-700">Trong tuần ▼</button>
      </div>
      <div className="flex items-end h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
