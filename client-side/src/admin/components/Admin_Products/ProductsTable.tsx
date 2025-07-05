"use client";
import { useState, useEffect } from "react";
import ProductTableWrapper from "./ProductTableWrapper";
import EditProductForm from "./EditProductForm";
import AddProductForm from "./AddProductForm"; // Import form popup thêm mới
import { fetchProductById, fetchProducts } from "@/services/productApi";

export default function ProductsTable({ initialProducts, addButton }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [showAddForm, setShowAddForm] = useState(false);

  // ==== State cho popup Edit ====
  const [editPopup, setEditPopup] = useState({
    visible: false,
    productId: null,
    productData: null,
    loading: false,
  });

  // Khi vào trang, tự động load danh sách sản phẩm
  useEffect(() => {
    reloadProducts();
  }, []);

  // Xử lý khi bấm Sửa
  const handleEditProduct = async (prod) => {
    setEditPopup({ visible: true, productId: prod.id || prod._id, productData: null, loading: true });
    const data = await fetchProductById(prod.id || prod._id);
    setEditPopup((prev) => ({ ...prev, productData: data, loading: false }));
  };

  // Đóng popup Sửa
  const handleCloseEdit = () => {
    setEditPopup({ visible: false, productId: null, productData: null, loading: false });
  };

  // Sau khi cập nhật xong (thêm/sửa), reload lại danh sách sản phẩm
  const reloadProducts = async () => {
    try {
      const { data: newProducts } = await fetchProducts();
      setProducts(Array.isArray(newProducts) ? newProducts : []);
    } catch (error) {
      console.error("Lỗi khi load sản phẩm:", error);
      setProducts([]);
    }
  };

  // Đóng popup Thêm, đồng thời reload list
  const handleCloseAdd = (shouldReload = false) => {
    setShowAddForm(false);
    if (shouldReload) reloadProducts();
  };

  // Đóng popup Edit, đồng thời reload list
  const handleCloseEditAndReload = () => {
    handleCloseEdit();
    reloadProducts();
  };

  return (
    <div>
      <ProductTableWrapper
        products={Array.isArray(products) ? products : []}
        onAddProduct={() => setShowAddForm(true)}
        onEditProduct={handleEditProduct}
        // Có thể truyền thêm các hàm xóa nếu muốn đồng bộ lại
      />

      {/* Popup Form Thêm sản phẩm */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <AddProductForm onClose={() => handleCloseAdd(true)} onAdded={reloadProducts} />
        </div>
      )}

      {/* Popup Form Sửa sản phẩm */}
      {editPopup.visible && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-[600px] relative animate-fadeIn">
            {editPopup.loading ? (
              <div className="p-8 text-center">Đang tải sản phẩm...</div>
            ) : (
              editPopup.productData && (
                <EditProductForm
                  product={editPopup.productData}
                  productId={editPopup.productId}
                  onClose={handleCloseEditAndReload}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
