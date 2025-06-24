"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const query = {
          id_cate: searchParams.get("id_cate") || undefined,
          color: searchParams.get("color") || undefined,
          size: searchParams.get("size") || undefined,
          priceRange: searchParams.get("priceRange") || undefined,
          sort:
            (searchParams.get("sort") as
              | "price-asc"
              | "price-desc"
              | "newest"
              | "best-seller") || undefined,
        };

        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts(query),
          fetchMemberBenefits(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 500));

        setProducts(productsData.products);
        const uniqueCategories = Array.from(
          new Set(
            productsData.products
              .filter((product) => product.category._id)
              .map((product) => ({
                _id: product.category._id as string,
                name: product.category.name,
              }))
              .map((cat) => JSON.stringify(cat))
          )
        ).map((cat) => JSON.parse(cat) as Category);

        uniqueCategories.sort((a, b) => a._id.localeCompare(b._id));
        setCategories(uniqueCategories);

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

    setProducts([]); // Reset products khi searchParams thay đổi
    loadData();
  }, [searchParams]);

  const handleApplyFilters = (filters: {
    sort?: string;
    id_cate?: string;
    priceRange?: string;
    color?: string;
    size?: string;
  }) => {
    // Nếu filters rỗng, đẩy URL về /products
    if (Object.keys(filters).length === 0) {
      router.push("/products");
      return;
    }

    // Xử lý filters có giá trị
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value) {
        params.set(key, value);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="py-8">
        <Container>
          <Breadcrumb />
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
          <div className="text-center p-3">Đang tải</div>
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
    <div className="gap-14 pb-14 overflow-x-hidden flex flex-col">
      <Container className="flex flex-col gap-[3.375rem] w-full">
        <div>
          <Breadcrumb />
          <CategorySwiper categories={categories} />
          <ProductGrid
            products={products}
            onApplyFilters={handleApplyFilters}
          />
        </div>
        <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}
