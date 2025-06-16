"use client";

import { useEffect, useState, useRef } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
          limit: 10,
          page: 1,
        };

        const [productsData, memberBenefits] = await Promise.all([
          fetchProducts(query),
          fetchMemberBenefits(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 800));

        setProducts(productsData.products);
        setHasMore(productsData.products.length === query.limit);
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
    setPage(1);
    setHasMore(true);
    loadData();
  }, [searchParams]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadingMore]);

  useEffect(() => {
    if (page === 1) return;

    async function loadMore() {
      try {
        setLoadingMore(true);
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
          limit: 10,
          page,
        };

        const productsData = await fetchProducts(query);
        setProducts((prev) => [...prev, ...productsData.products]);
        setHasMore(productsData.products.length === query.limit);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi khi tải thêm sản phẩm."
        );
      } finally {
        setLoadingMore(false);
      }
    }

    loadMore();
  }, [page, searchParams]);

  const handleApplyFilters = (filters: {
    sort?: string;
    id_cate?: string;
    priceRange?: string;
    color?: string;
    size?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.sort) params.set("sort", filters.sort);
    else params.delete("sort");
    if (filters.id_cate) params.set("id_cate", filters.id_cate);
    else params.delete("id_cate");
    if (filters.priceRange) params.set("priceRange", filters.priceRange);
    else params.delete("priceRange");
    if (filters.color) params.set("color", filters.color);
    else params.delete("color");
    if (filters.size) params.set("size", filters.size);
    else params.delete("size");

    router.push(`/products?${params.toString()}`);
  };

  if (loading && !loadingMore) {
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
          <ProductGrid products={products} onApplyFilters={handleApplyFilters} />
          {hasMore && (
            <div ref={loadMoreRef} className="text-center py-4">
              {loadingMore && <div className="text-center p-3">Đang tải thêm...</div>}
            </div>
          )}
        </div>
        <NewsSection newsItems={newsItems} />
      </Container>
    </div>
  );
}