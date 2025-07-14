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
import { SortOption } from "@/types/filter";
import { fetchCouponByCode, fetchCouponById } from "@/services/couponApi";
import { Toaster } from "react-hot-toast";

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
  const [totalProducts, setTotalProducts] = useState(0);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const validSortOptions: SortOption[] = [
          "newest",
          "oldest",
          "price_asc",
          "price_desc",
          "best_selling",
        ];
        const sort_by = searchParams.get("sort_by");
        const couponId = searchParams.get("coupon");
        let couponFilteredProductIds: string[] = [];
        let couponFilteredCategoryIds: string[] = [];

        if (couponId) {
          try {
            const coupon = await fetchCouponByCode(couponId);
            if (coupon.applicableProducts.length > 0) {
              couponFilteredProductIds = (coupon.applicableProducts || []).map(
                (p: any) => (typeof p === "string" ? p : p._id || p.toString())
              );
            } else if (coupon.applicableCategories.length > 0) {
              couponFilteredCategoryIds = coupon.applicableCategories.map((c) =>
                typeof c === "string" ? c : c._id
              );
            }
          } catch (err) {
            console.error("Không thể lọc theo coupon:", err);
            setError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            return;
          }
        }
        const query = {
          id_cate: searchParams.get("id_cate") || undefined,
          color: searchParams.get("color") || undefined,
          size: searchParams.get("size") || undefined,
          minPrice: searchParams.get("minPrice")
            ? Number(searchParams.get("minPrice"))
            : undefined,
          maxPrice: searchParams.get("maxPrice")
            ? Number(searchParams.get("maxPrice"))
            : undefined,
          sort_by:
            sort_by && validSortOptions.includes(sort_by as SortOption)
              ? (sort_by as SortOption)
              : undefined,
          is_active: true,
        };

        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts(query),
          fetchMemberBenefits(),
        ]);

        let filteredProducts = productsData.data;

        if (couponFilteredProductIds.length > 0) {
          filteredProducts = filteredProducts.filter((p) =>
            couponFilteredProductIds.includes(p.id)
          );
        } else if (couponFilteredCategoryIds.length > 0) {
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.categoryId !== null &&
              couponFilteredCategoryIds.includes(p.categoryId)
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);

        const uniqueCategories = Array.from(
          new Set(
            productsData.data
              .filter((product) => product.category?._id)
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

    setProducts([]);
    loadData();
  }, [searchParams]);

  const handleApplyFilters = (filters: {
    sort_by?: SortOption;
    id_cate?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  }) => {
    if (Object.keys(filters).length === 0) {
      router.push("/products");
      return;
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, encodeURIComponent(value.toString()));
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

  const validSortOptions: SortOption[] = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "best_selling",
  ];
  const currentFilters = {
    id_cate: searchParams.get("id_cate") || undefined,
    sort_by:
      searchParams.get("sort_by") &&
      validSortOptions.includes(searchParams.get("sort_by") as SortOption)
        ? (searchParams.get("sort_by") as SortOption)
        : undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    color: searchParams.get("color") || undefined,
    size: searchParams.get("size") || undefined,
  };

  return (
    <div className="gap-14 pb-14 overflow-x-hidden flex flex-col">
      <Container className="flex flex-col gap-[3.375rem] w-full">
        <Toaster position="top-right" />
        <div>
          <Breadcrumb />
          <CategorySwiper categories={categories} />
          <ProductGrid
            products={products}
            totalProducts={totalProducts}
            onApplyFilters={handleApplyFilters}
            currentFilters={currentFilters}
          />
        </div>
        <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}
