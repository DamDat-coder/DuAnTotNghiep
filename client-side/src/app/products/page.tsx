"use client";

import { useEffect, useState, useMemo } from "react";
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

// Các giá trị sort hợp lệ
const VALID_SORT_OPTIONS: SortOption[] = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "best_selling",
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<CategoryProduct[]>([]);
  const [newsItems, setNewsItems] = useState<NewsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đọc và parse query string từ URL
  const filters = useMemo(() => {
    const getParam = (key: string) => searchParams.get(key) || undefined;
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

        // Nếu có mã coupon thì fetch và lấy danh sách product/category tương ứng
        if (filters.coupon) {
          try {
            const coupon = await fetchCouponByCode(filters.coupon);

            // Lấy danh sách id sản phẩm áp dụng được coupon
            couponProductIds = (coupon.applicableProducts || []).map((p: any) =>
              typeof p === "string" ? p : p._id || p.toString()
            );

            // Lấy danh sách id danh mục áp dụng được coupon
            couponCategoryIds = (coupon.applicableCategories || []).map(
              (c: any) => (typeof c === "string" ? c : c._id)
            );
          } catch {
            // Trường hợp mã giảm giá sai/hết hạn
            setError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            setLoading(false);
            return;
          }
        }

        // Gọi song song cả API sản phẩm & quyền lợi thành viên
        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts({
            id_cate: filters.id_cate,
            color: filters.color,
            size: filters.size,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sort_by: filters.sort_by,
            is_active: true,
          }),
          fetchMemberBenefits(),
        ]);

        let filteredProducts = productsData.data;

        // Nếu coupon có lọc theo sản phẩm
        if (couponProductIds.length > 0) {
          filteredProducts = filteredProducts.filter((p) =>
            couponProductIds.includes(p.id)
          );
        }
        // Nếu coupon có lọc theo danh mục
        else if (couponCategoryIds.length > 0) {
          filteredProducts = filteredProducts.filter(
            (p) => p.categoryId && couponCategoryIds.includes(p.categoryId)
          );
        }

        setProducts(filteredProducts);

        // Lấy danh sách danh mục từ sản phẩm đang có (không trùng lặp)
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

        // Sắp xếp danh mục theo tên
        uniqueCategories.sort((a, b) => a._id.localeCompare(b._id));
        setCategories(uniqueCategories);

        // Map quyền lợi thành viên thành dạng news
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

    setProducts([]); // Clear sản phẩm cũ khi chuyển trang/filter
    loadData();
  }, [filters]);

  // Cập nhật URL khi người dùng thay đổi bộ lọc
  const handleApplyFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        params.set(key, encodeURIComponent(val.toString()));
      }
    });
    router.push(
      params.toString() ? `/products?${params.toString()}` : "/products"
    );
  };

  // Loading UI
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

  // Error UI
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
          <CategorySwiper categories={categories} />
          <ProductGrid
            products={products}
            totalProducts={products.length}
            onApplyFilters={handleApplyFilters}
            currentFilters={currentFilters}
          />
        </div>
        <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}
