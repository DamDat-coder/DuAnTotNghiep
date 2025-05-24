"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProducts } from "@/services/productApi";
import { fetchMemberBenefits } from "@/services/memberBenefitApi";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import CategorySwiper from "@/components/Products/CategorySwiper";
import ProductGrid from "@/components/Products/ProductGrid";
import NewsSection from "@/components/Products/NewsSection";
import { IProduct } from "@/types/product";

interface News {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const query = {
          gender: searchParams.get("gender") || undefined,
          discount: searchParams.get("discount") === "true" ? true : undefined,
        };

        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts(query),
          fetchMemberBenefits(),
        ]);

        setProducts(productsData);
        setCategories(
          Array.from(new Set(productsData.map((product) => product.category)))
        );

        const news = memberBenefits.map((item, index) => ({
          ...item,
          img: item.image,
          newsCategory: ["Khuyến Mãi", "Dịch Vụ", "Sự Kiện"][index] || "Khác",
          name:
            ["Ưu đãi tháng 3", "Giao hàng miễn phí 2025", "Quà tặng đặc biệt"][
              index
            ] || "Tin tức",
        }));
        setNewsItems(news);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải dữ liệu sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="py-8">
        <Container>
          <p className="text-center text-gray-500">Đang tải...</p>
        </Container>
      </div>
    );
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

  return (
    <div className="py-3 px-6 overflow-x-hidden flex flex-col gap-6">
      <Container>
        <Breadcrumb />
        <CategorySwiper categories={categories} />
        <ProductGrid products={products} />
        <br />
        <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}
