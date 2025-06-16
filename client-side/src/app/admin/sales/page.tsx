"use client";

import { useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableSaleWrapper from "@/admin/components/Admin_Sale/TableSaleWrapper";
import SaleTableBody from "@/admin/components/Admin_Sale/SaleTableBody";
import { dummySales, Sale } from "@/types/sale";
import { Pagination } from "@/admin/components/ui/Panigation";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(dummySales);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPage = Math.ceil(sales.length / pageSize);
  const paginatedSales = sales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number, newValue: boolean) => {
    setSales((prev) =>
      prev.map((sale) =>
        sale.id === id ? { ...sale, active: newValue } : sale
      )
    );
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
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </AdminLayout>
  );
}
