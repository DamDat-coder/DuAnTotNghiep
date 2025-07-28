'use client';

import { useAuth } from "@/contexts/AuthContext";
import Stats from './Stats';
import RevenueChart from './RevenueChart';
import BestSellerTable from './BestSellerTable';
import CustomerChart from './CustomerChart';
import TransactionHistory from './TransactionHistory';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="pt-10 px-6 max-w-[1200px] mx-auto text-center text-red-500 font-semibold">
        Vui lòng đăng nhập để sử dụng dashboard.
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="pt-10 px-6 max-w-[1200px] mx-auto text-center text-red-500 font-semibold">
        Bạn không có quyền truy cập dashboard này.
      </div>
    );
  }

  return (
    <main className="pt-10 px-6 max-w-[1200px] mx-auto">
      {/* Stats row */}
      <div className="flex gap-6 mb-6">
        <Stats />
      </div>

      {/* RevenueChart full width */}
      <div className="w-full mb-6">
        <RevenueChart />
      </div>

      {/* BestSellerTable full width */}
      <div className="w-full mb-6">
        <BestSellerTable />
      </div>

      {/* CustomerChart + TransactionHistory */}
      <div className="flex gap-6">
        <div className="w-[743px]">
          <TransactionHistory />
        </div>
        <div className="w-[359px]">
          <CustomerChart />
        </div>
      </div>
    </main>
  );
}
