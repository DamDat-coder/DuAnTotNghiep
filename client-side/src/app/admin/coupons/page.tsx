"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TablecouponWrapper from "@/admin/components/Admin_Coupon/TableCouponWrapper";
import { Pagination } from "@/admin/components/ui/Panigation";
import { fetchCoupons, updateCouponStatus } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import CouponTableBody from "@/admin/components/Admin_Coupon/CouponTableBody";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCoupons()
      .then((res) => {
        console.log("Coupons from API:", res);
        setCoupons(res.coupons); // Use res.coupons instead of res
      })
      .catch(console.error);
  }, []);

  const totalPage = Math.ceil(coupons.length / pageSize);
  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = async (id: string, newValue: boolean) => {
    try {
      await updateCouponStatus(id, newValue);
      setCoupons((prev) =>
        prev.map((coupon) =>
          coupon._id === id ? { ...coupon, active: newValue } : coupon
        )
      );
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <AdminLayout
      pageTitle="Khuyến mãi"
      pageSubtitle="Thông tin chi tiết về các chương trình khuyến mãi của bạn"
    >
      <TablecouponWrapper>
        <CouponTableBody
          coupons={paginatedCoupons}
          onToggleActive={handleToggleActive}
        />
      </TablecouponWrapper>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminLayout>
  );
}
