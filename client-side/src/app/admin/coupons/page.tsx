"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { Pagination } from "@/admin/components/ui/Panigation";
import { fetchCoupons, updateCouponStatus } from "@/services/couponApi";
import { Coupon, CouponResponse } from "@/types/coupon";
import CouponTableBody from "@/admin/components/Admin_Coupon/CouponTableBody";
import TableCouponWrapper from "@/admin/components/Admin_Coupon/TableCouponWrapper";

export default function CouponsPage() {
  const [couponResponse, setCouponResponse] = useState<CouponResponse>({
    data: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
      } = {
        page: currentPage,
        limit: 10,
        search: search || undefined,
      };

      if (filter === "true") {
        params.isActive = true;
      } else if (filter === "false") {
        params.isActive = false;
      } else {
        params.isActive = undefined;
      }


      const res = await fetchCoupons(params);

      setCouponResponse(res);
    } catch (error: any) {
      console.error("Error loading coupons:", error);
      setError(error.message || "Không thể tải danh sách mã giảm giá");
      setCouponResponse({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [currentPage, search, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const handleToggleActive = async (id: string, newValue: boolean) => {
    try {
      await updateCouponStatus(id, newValue);
      setCouponResponse((prev) => ({
        ...prev,
        data: prev.data.map((coupon) =>
          coupon._id === id ? { ...coupon, is_active: newValue } : coupon
        ),
      }));
    } catch (err: any) {
      console.error("Error updating coupon status:", err);
      setError("Cập nhật trạng thái thất bại!");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    console.log("Edit coupon:", coupon);
    // Implement edit functionality, e.g., open a modal
  };

  return (
    <AdminLayout
      pageTitle="Khuyến mãi"
      pageSubtitle="Thông tin chi tiết về các chương trình khuyến mãi của bạn"
    >
      <TableCouponWrapper onSearchChange={setSearch} onFilterChange={setFilter}>
        <CouponTableBody
          coupons={couponResponse.data}
          onToggleActive={handleToggleActive}
          onCouponsChange={(newCoupons) =>
            setCouponResponse((prev) => ({ ...prev, data: newCoupons }))
          }
          onEditCoupon={handleEditCoupon}
        />
      </TableCouponWrapper>

      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}

      {!loading && !error && couponResponse.data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Không tìm thấy mã giảm giá</p>
          {search && (
            <p className="text-sm text-gray-400 mt-2">
              Không có mã giảm giá nào khớp với từ khóa "{search}".
            </p>
          )}
        </div>
      )}

      {couponResponse.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPage={couponResponse.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </AdminLayout>
  );
}
