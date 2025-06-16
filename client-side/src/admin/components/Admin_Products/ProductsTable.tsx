// page.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/productApi";
import ProductTableWrapper from "./ProductTableWrapper";
// import Panigation nếu bạn muốn dùng ở ngoài wrapper

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchProducts();
      setProducts(data);
    }
    load();
  }, []);

  // Thêm, sửa, xóa demo
  const handleAddProduct = () => setShowAddForm(true);
  const handleEditProduct = (prod) => alert("Sửa sản phẩm: " + prod.name);
  const handleDeleteProduct = (id) => alert("Xoá sản phẩm: " + id);

  return (
    <div>
      <ProductTableWrapper
        products={products}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
      {/* {showAddForm && <AddProductForm onClose={() => setShowAddForm(false)} />} */}
    </div>
  );
}
