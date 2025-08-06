"use client";

import { useEffect, useState } from "react";
import ProductsTable from "@/admin/components/Admin_Products/ProductsTable";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm.");
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout pageTitle="Sản phẩm" pageSubtitle="Quản lý sản phẩm.">
      <div className="products-page w-full mx-auto h-full flex flex-col">
        {error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <ProductsTable initialProducts={products} />
        )}
      </div>
    </AdminLayout>
  );
}
