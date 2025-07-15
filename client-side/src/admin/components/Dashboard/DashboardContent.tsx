'use client';

import Stats from './Stats';
import RevenueChart from './RevenueChart';
import BestSellerTable from './BestSellerTable';
import CustomerChart from './CustomerChart';
import TransactionHistory from './TransactionHistory';

export default function DashboardPage() {
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
