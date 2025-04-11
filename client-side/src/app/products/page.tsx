// src/app/products/page.tsx
import { fetchProducts, fetchMemberBenefits } from "@/services/api";
import { IProduct } from "@/types";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import CategorySwiper from "@/components/Products/CategorySwiper";
import ProductGrid from "@/components/Products/ProductGrid";
import NewsSection from "@/components/Products/NewsSection";
import { Suspense } from "react";

interface News {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}

export default async function ProductsPage() {
  let products: IProduct[] = [];
  let newsItems: News[] = [];
  let error = null;

  try {
    products = await fetchProducts();
    const memberBenefits = await fetchMemberBenefits();
    newsItems = memberBenefits.map((item, index) => ({
      ...item,
      img: item.image,
      newsCategory: ["Khuyến Mãi", "Dịch Vụ", "Sự Kiện"][index],
      name: ["Ưu đãi tháng 3", "Giao hàng miễn phí 2025", "Quà tặng đặc biệt"][index],
    }));
  } catch (err) {
    error = "Có lỗi xảy ra khi tải dữ liệu sản phẩm.";
  }

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <p className="text-center text-red-500">{error}</p>
        </Container>
      </div>
    );
  }

  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <div className="py-3 px-6 overflow-x-hidden flex flex-col gap-6">
      <Container>
        <Breadcrumb />
        <CategorySwiper categories={categories} />
        <Suspense fallback={<p className="text-center text-gray-500">Đang tải...</p>}>
          <ProductGrid products={products} />
        </Suspense>
        <br />
      <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}