"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchProducts } from "@/services/productApi";
import { fetchMemberBenefits } from "@/services/memberBenefitApi";
import { fetchCouponByCode } from "@/services/couponApi";

import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import CategorySwiper from "@/components/Products/CategorySwiper/CategorySwiper";
import ProductGrid from "@/components/Products/ProductGrid/ProductGrid";
import NewsSection from "@/components/Products/NewsSection/NewsSection";
import { Toaster } from "react-hot-toast";

import { IProduct } from "@/types/product";
import { SortOption } from "@/types/filter";
import { NewsProduct } from "@/types/new";
import { CategoryProduct } from "@/types/category";

const VALID_SORT_OPTIONS: SortOption[] = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "best_selling",
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<CategoryProduct[]>([]);
  const [newsItems, setNewsItems] = useState<NewsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đọc và parse query string từ URL
  const filters = useMemo(() => {
    const getParam = (key: string) => {
      const value = searchParams.get(key);
      if (value && key === "color") {
        try {
          // Giải mã hai lần để xử lý double-encoding
          return decodeURIComponent(decodeURIComponent(value));
        } catch (e) {
          console.error(`Error decoding ${key}:`, e);
          return value;
        }
      }
      return value || undefined;
    };

    return {
      id_cate: getParam("id_cate"),
      color: getParam("color"),
      size: getParam("size"),
      minPrice: getParam("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: getParam("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sort_by: VALID_SORT_OPTIONS.includes(getParam("sort_by") as SortOption)
        ? (getParam("sort_by") as SortOption)
        : undefined,
      coupon: getParam("coupon"),
    };
  }, [searchParams]);
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        let couponProductIds: string[] = [];
        let couponCategoryIds: string[] = [];

        if (filters.coupon) {
          try {
            const coupon = await fetchCouponByCode(filters.coupon);
            couponProductIds = (coupon.applicableProducts || []).map((p: any) =>
              typeof p === "string" ? p : p._id || p.toString()
            );
            couponCategoryIds = (coupon.applicableCategories || []).map(
              (c: any) => (typeof c === "string" ? c : c._id)
            );
          } catch {
            setError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            setLoading(false);
            return;
          }
        }

        // Giải mã color trước khi gửi tới fetchProducts
        const decodedFilters = {
          ...filters,
          color: filters.color
            ? (() => {
                try {
                  return decodeURIComponent(decodeURIComponent(filters.color));
                } catch (e) {
                  console.error("Error decoding color for fetchProducts:", e);
                  return filters.color;
                }
              })()
            : undefined,
        };

        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts({
            id_cate: decodedFilters.id_cate,
            color: decodedFilters.color,
            size: decodedFilters.size,
            minPrice: decodedFilters.minPrice,
            maxPrice: decodedFilters.maxPrice,
            sort_by: decodedFilters.sort_by,
            is_active: true,
          }),
          fetchMemberBenefits(),
        ]);

        let filteredProducts = productsData.data;

        if (couponProductIds.length > 0) {
          filteredProducts = filteredProducts.filter((p) =>
            couponProductIds.includes(p.id)
          );
        } else if (couponCategoryIds.length > 0) {
          filteredProducts = filteredProducts.filter(
            (p) => p.categoryId && couponCategoryIds.includes(p.categoryId)
          );
        }

        setProducts(filteredProducts);

        const uniqueCategories: CategoryProduct[] = Array.from(
          new Set(
            productsData.data
              .filter((p) => p.category?._id)
              .map((p) =>
                JSON.stringify({
                  _id: p.category._id,
                  name: p.category.name,
                })
              )
          )
        ).map((c) => JSON.parse(c));

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
    };

    setProducts([]);
    loadData();
  }, [filters]);

  const handleApplyFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        let decodedValue = value;
        if (typeof value === "string") {
          try {
            decodedValue = decodeURIComponent(decodeURIComponent(value));
          } catch (e) {
            console.error(`Error decoding ${key} in handleApplyFilters:`, e);
          }
        }
        params.set(key, decodedValue.toString());
      }
    });
    router.push(
      params.toString() ? `/products?${params.toString()}` : "/products"
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <Container>
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

  const { coupon, ...currentFilters } = filters;

  return (
    <div className="gap-14 pb-14 overflow-x-hidden flex flex-col">
      <Container className="flex flex-col gap-[3.375rem] w-full">
        <Toaster position="top-right" />
        <div>
          <Breadcrumb />
          <Suspense fallback={null}>
            <CategorySwiper categories={categories} />
          </Suspense>
          <Suspense fallback={null}>
            <ProductGrid
              products={products}
              totalProducts={products.length}
              onApplyFilters={handleApplyFilters}
              currentFilters={currentFilters}
            />
          </Suspense>
        </div>
        <NewsSection />
      </Container>
    </div>
  );
}
