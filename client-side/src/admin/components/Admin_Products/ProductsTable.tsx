"use client";
import { useState, useEffect } from "react";
import ProductTableWrapper from "./ProductTableWrapper";
import EditProductForm from "./EditProductForm";
import AddProductForm from "./AddProductForm";
import { fetchProductById, fetchProductsAdmin } from "@/services/productApi";
import { IProduct } from "@/types/product";

interface ProductsTableProps {
  initialProducts: IProduct[];
  addButton?: React.ReactNode; // Nếu không dùng prop này, có thể bỏ hẳn dòng này
}

interface EditPopupState {
  visible: boolean;
  productId: string | null;
  productData: IProduct | null;
  loading: boolean;
}

export default function ProductsTable({ initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts || []);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editPopup, setEditPopup] = useState<EditPopupState>({
    visible: false,
    productId: null,
    productData: null,
    loading: false,
  });

  // Khi vào trang, tự động load danh sách sản phẩm
  useEffect(() => {
    reloadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý khi bấm Sửa
  const handleEditProduct = async (prod: IProduct) => {
    const id = prod.id || (prod as any)._id || "";
    setEditPopup({ visible: true, productId: id, productData: null, loading: true });
    const data = await fetchProductById(id);
    setEditPopup((prev) => ({
      ...prev,
      productData: data,
      loading: false,
    }));
  };

  const handleCloseEdit = () => {
    setEditPopup({ visible: false, productId: null, productData: null, loading: false });
  };

  // Đổi sang fetchProductsAdmin ở đây
  const reloadProducts = async () => {
    try {
      const { data: newProducts } = await fetchProductsAdmin();
      setProducts(Array.isArray(newProducts) ? newProducts : []);
    } catch (error) {
      console.error("Lỗi khi load sản phẩm:", error);
      setProducts([]);
    }
  };

  const handleCloseAdd = (shouldReload = false) => {
    setShowAddForm(false);
    if (shouldReload) reloadProducts();
  };

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
        onDeleteProduct={reloadProducts} // Thêm callback này nếu ProductTableWrapper yêu cầu!
      />

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <AddProductForm onClose={() => handleCloseAdd(true)} onAdded={reloadProducts} />
        </div>
      )}

      {editPopup.visible && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-[600px] relative animate-fadeIn">
            {editPopup.loading ? (
              <div className="p-8 text-center">Đang tải sản phẩm...</div>
            ) : (
              editPopup.productData && editPopup.productId && (
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
