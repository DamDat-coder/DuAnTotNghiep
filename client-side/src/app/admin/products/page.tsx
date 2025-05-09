// app/admin/products/page.tsx
import ProductsTable from "@/admin/components/Admin_Products/ProductsTable";
import AdminLayout, { NavigationItem } from "@/admin/layouts/AdminLayout";
import { fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types/index";

async function fetchProductsData() {
  try {
    const products = await fetchProducts();
    return { products, error: null };
  } catch (err) {
    return { products: [], error: "Không thể tải danh sách sản phẩm." };
  }
}

export default async function ProductsPage() {
  const { products, error } = await fetchProductsData();

  const navigationItems: NavigationItem[] = [
    { label: "Danh sách sản phẩm", href: "/admin/products/list" },
  ];

  return (
    <AdminLayout pageTitle="Sản phẩm" pageSubtitle="Quản lý sản phẩm.">
      <div className="products-page w-full mx-auto h-full flex flex-col">
        {error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <ProductsTable
            initialProducts={products}
            navigationItems={navigationItems}
            addButton={{ label: "Thêm sản phẩm", href: "/admin/products/add" }}
          />
        )}
      </div>
    </AdminLayout>
  );
}