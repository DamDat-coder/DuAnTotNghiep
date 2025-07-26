'use client';

import { useAuth } from "@/contexts/AuthContext";
import Stats from './Stats';
import RevenueChart from './RevenueChart';
import BestSellerTable from './BestSellerTable';
import CustomerChart from './CustomerChart';
import TransactionHistory from './TransactionHistory';

export default function DashboardPage() {
  const { user } = useAuth();

  // Nếu chưa login thì không cho xem dashboard
  if (!user) {
    return (
      <div className="pt-10 px-6 max-w-[1200px] mx-auto text-center text-red-500 font-semibold">
        Vui lòng đăng nhập để sử dụng dashboard.
      </div>
    );
  }

  // Nếu không phải admin thì chặn truy cập
  if (user.role !== "admin") {
    return (
      <div className="pt-10 px-6 max-w-[1200px] mx-auto text-center text-red-500 font-semibold">
        Bạn không có quyền truy cập dashboard này.
      </div>
    );
  }

  // Chỉ khi user đã login và là admin mới render dashboard thật sự
  return (
    <main className="pt-10 px-6 max-w-[1200px] mx-auto">
      {/* Stats row */}
      <div className="flex gap-6 mb-6">
        <Stats />
      </div>
      {/* Main content: 2 cột */}
      <div className="flex gap-6">
        {/* Cột trái lớn */}
        <div className="flex flex-col gap-6 w-[743px]">
          <RevenueChart />
          <BestSellerTable />
        </div>
        {/* Cột phải nhỏ */}
        <div className="flex flex-col gap-6 w-[359px]">
          <CustomerChart />
          <TransactionHistory />
        </div>
      </div>
    </main>
  );
}
