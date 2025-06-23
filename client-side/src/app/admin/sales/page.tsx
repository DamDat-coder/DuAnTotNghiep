"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableSaleWrapper from "@/admin/components/Admin_Sale/TableSaleWrapper";
import SaleTableBody from "@/admin/components/Admin_Sale/SaleTableBody";
import { Sale } from "@/types/sale";
import { Pagination } from "@/admin/components/ui/Panigation";
import { fetchCoupons, updateCouponStatus } from "@/services/couponApi";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCoupons()
      .then((res) => {
        console.log("Coupons from API:", res);
        setSales(res); // <- fix chỗ này tuỳ theo res
      })
      .catch(console.error);
  }, []);

  const totalPage = Math.ceil(sales.length / pageSize);
  const paginatedSales = sales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = async (id: string, newValue: boolean) => {
    try {
      await updateCouponStatus(id, newValue);
      setSales((prev) =>
        prev.map((sale) =>
          sale.id === id ? { ...sale, active: newValue } : sale
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
      <TableSaleWrapper>
        <SaleTableBody
          sales={paginatedSales}
          onToggleActive={handleToggleActive}
        />
      </TableSaleWrapper>

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
