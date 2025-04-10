// src/admin/components/UserRegistrationChart.tsx
"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function UserRegistrationChart() {
  const lineData = {
    labels: ["01/03", "02/03", "03/03", "04/03", "05/03", "06/03", "07/03"],
    datasets: [
      {
        label: "Người dùng đăng ký",
        data: [5, 10, 8, 15, 12, 20, 25],
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Số lượng người dùng đăng ký theo thời gian",
      },
    },
  };

  return (
    <>
      <h2 className="text-2xl font-bold">Số lượng người đăng ký</h2>
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <Line data={lineData} options={lineOptions} />
      </div>
    </>
  );
}