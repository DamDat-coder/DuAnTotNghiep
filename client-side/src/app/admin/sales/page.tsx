"use client";

import SaleTableBody from "@/admin/components/Admin_Sale/SaleTableBody";
import TableSaleWrapper from "@/admin/components/Admin_Sale/TableSaleWrapper";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { dummySales, Sale } from "@/types/sale";
import { useState } from "react";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(dummySales);
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
        <SaleTableBody sales={dummySales} onToggleActive={handleToggleActive} />
      </TableSaleWrapper>
    </AdminLayout>
  );
}
