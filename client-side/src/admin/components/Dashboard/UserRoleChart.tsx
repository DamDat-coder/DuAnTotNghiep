// src/admin/components/UserRoleChart.tsx
"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { IUser } from "@/services/api";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UserRoleChartProps {
  users: IUser[];
}

export default function UserRoleChart({ users }: UserRoleChartProps) {
  const adminCount = users.filter((user) => user.role === "admin").length;
  const userCount = users.filter((user) => user.role === "user").length;

  const barData = {
    labels: ["Admin", "User"],
    datasets: [
      {
        label: "Số lượng người dùng",
        data: [adminCount, userCount],
        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Số lượng người dùng theo vai trò",
      },
    },
  };

  return (
    <>
      <h2 className="text-2xl font-bold">Số lượng người dùng</h2>
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <Bar data={barData} options={barOptions} />
      </div>
    </>
  );
}