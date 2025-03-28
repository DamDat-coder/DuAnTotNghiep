// app/admin/dashboard/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { fetchUsers, User } from "@/services/api"; // Import fetchUsers và User type
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu người dùng từ API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Dữ liệu cho biểu đồ cột: Số lượng người dùng theo role
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

  // Dữ liệu giả lập cho biểu đồ đường: Số lượng người dùng đăng ký theo ngày
  const lineData = {
    labels: ["01/03", "02/03", "03/03", "04/03", "05/03", "06/03", "07/03"], // Ngày giả lập
    datasets: [
      {
        label: "Người dùng đăng ký",
        data: [5, 10, 8, 15, 12, 20, 25], // Dữ liệu giả lập
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
    <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
      <div className="dashboard-page w-full h-auto mx-auto bg-white rounded-[2.125rem] px-12 py-8 flex flex-col gap-8">

        {loading ? (
          <p className="text-center text-lg">Đang tải...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Biểu đồ cột: Số lượng người dùng theo role */}
            <h2 className="text-2xl font-bold">Số lượng người dùng</h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <Bar data={barData} options={barOptions} />
            </div>

            {/* Biểu đồ đường: Số lượng người dùng đăng ký theo thời gian */}
            <h2 className="text-2xl font-bold">Số lượng người đăng ký</h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}