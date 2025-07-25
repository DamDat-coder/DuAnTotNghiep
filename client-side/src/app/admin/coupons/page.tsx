"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchCoupons } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import TableCouponWrapper from "@/admin/components/Admin_Coupon/TableCouponWrapper";

export default function CouponsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const pageSize = 10;
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons(
        currentPage,
        pageSize,
        search,
        filter === "all"
          ? undefined
          : filter === "active"
          ? true
          : filter === "inactive"
          ? false
          : undefined
      );
      setCoupons(data.coupons ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setCurrentPage(data.currentPage ?? 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã khuyến mãi:", error);
      setCoupons([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi search, filter hoặc currentPage thay đổi
  useEffect(() => {
    loadCoupons();
  }, [search, filter, currentPage]);

  // Reset về trang 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Khuyến mãi"
      pageSubtitle="Thông tin chi tiết về các chương trình khuyến mãi của bạn"
    >
      <TableCouponWrapper
        coupons={coupons}
        currentPage={currentPage}
        totalPage={totalPages}
        onPageChange={setCurrentPage}
        filter={filter}
        search={search}
        setFilter={setFilter}
        setSearch={setSearch}
        onUpdate={setCoupons}
        onDelete={(id: string) => {
          setCoupons((prev) => prev.filter((coupon) => coupon._id !== id));
        }}
      />

      {loading && (
        <p className="text-center text-gray-500 mt-4">Đang tải dữ liệu...</p>
      )}

      {!loading && coupons.length === 0 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 text-lg">Không tìm thấy mã khuyến mãi</p>
          {search && (
            <p className="text-sm text-gray-400 mt-2">
              Không có mã khuyến mãi nào khớp với từ khóa "{search}".
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
