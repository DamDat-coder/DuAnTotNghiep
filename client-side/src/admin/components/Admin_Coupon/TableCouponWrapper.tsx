import { ReactNode } from "react";
import CouponControlBar from "./CouponControlBar";
import Image from "next/image";
import CouponTableBody from "./CouponTableBody"; // Import CouponTableBody
import { Coupon } from "@/types/coupon";

interface TableCouponWrapperProps {
  children: ReactNode;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  coupons: Coupon[];
  onToggleActive: (id: string, newValue: boolean) => void;
  onCouponsChange: (newCoupons: any[]) => void;
  onEditCoupon: (coupon: any) => void; // Thay bằng Coupon nếu có type
}

export default function TableCouponWrapper({
  children,
  onSearchChange,
  onFilterChange,
  coupons,
  onToggleActive,
  onCouponsChange,
  onEditCoupon,
}: TableCouponWrapperProps) {
  const filteredUsers = coupons.filter((user) => {
    const matchFilter = filter === "all" || user.role === filter;
    const name = user.name || "";
    const email = user.email || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  return (
    <div className="space-y-4 mt-6">
      <CouponControlBar
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[177px] px-4 h-[64px] align-middle py-0 rounded-tl-[12px] rounded-bl-[12px]">
                Mã KM
              </th>
              <th className="w-[360px] px-4 h-[64px] align-middle py-0">
                Giảm giá
              </th>
              <th className="w-[224px] px-4 h-[64px] align-middle py-0">
                Thời gian
              </th>
              <th className="w-[134px] px-4 h-[64px] align-middle py-0">
                Lượt dùng
              </th>
              <th className="w-[105px] px-4 h-[64px] align-middle py-0">
                Trạng thái
              </th>
              <th className="w-[60px] px-4 h-[64px] align-middle py-0 rounded-tr-[12px] rounded-br-[12px]">
                <div className="flex items-center justify-end h-[64px]">
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <CouponTableBody
              coupons={coupons}
              onToggleActive={onToggleActive}
              onCouponsChange={onCouponsChange}
              onEditCoupon={onEditCoupon}
            />
          </tbody>
        </table>
      </div>
      {children && children(filteredCoupons)}
    </div>
  );
}
