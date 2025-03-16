"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchProducts } from "../../services/api";
import { Product } from "../../types";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const PRODUCTS_PER_PAGE = 10;

  useEffect(() => {
    const loadInitialProducts = async () => {
      setInitialLoading(true);
      const data = await fetchProducts();
      console.log("Total products from API:", data.length);
      setProducts(data);
      setDisplayedProducts(data.slice(0, PRODUCTS_PER_PAGE));
      setHasMore(data.length > PRODUCTS_PER_PAGE);
      setInitialLoading(false);
    };
    loadInitialProducts();
  }, []);

  useEffect(() => {
    if (initialLoading || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          console.log("Observer triggered, loading more...");
          loadMoreProducts();
        }
      },
      { rootMargin: "600px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      console.log("Observing ref:", currentRef);
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [initialLoading, hasMore, loading, displayedProducts]);

  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = products.slice(currentLength, currentLength + PRODUCTS_PER_PAGE);

    console.log("Loading more:", {
      currentLength,
      nextProductsLength: nextProducts.length,
      total: products.length,
    });

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      const newLength = currentLength + nextProducts.length;
      setHasMore(newLength < products.length);
      setLoading(false);
      console.log("Loaded, new total displayed:", newLength);
    }, 500);
  };

  const countProducts = (products: Product[]): number => {
    return products.length;
  };

  const categories = Array.from(new Set(products.map((product) => product.category)));

  const renderProductCard = (product: Product) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="product w-[171px] h-[22rem] flex flex-col bg-white shadow-xl relative">
        <Image
          src={`/featured/${product.image}`}
          alt={product.name || "Sản phẩm"}
          width={171}
          height={269}
          className="w-[171px] h-[269px] object-cover"
          draggable={false}
          loading="lazy"
        />
        <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </div>
        <button className="absolute top-[0.5rem] right-[0.5rem]">
          <img src="/product/product_addToCart.svg" alt="Thêm vào giỏ" />
        </button>
        <div className="content flex flex-col p-4">
          <div className="name text-lg font-bold text-[#374151] pb-2 truncate">
            {product.name || "Sản phẩm"}
          </div>
          <div className="category desc-text text-[#374151] truncate">
            {product.category || "Danh mục"}
          </div>
          <div className="price-container flex items-center gap-3 pt-2">
            <div className="discountPrice text-[1rem] font-bold text-red-500">
              {discountPrice.toLocaleString("vi-VN")}₫
            </div>
            <div className="price text-[0.875rem] text-[#374151] line-through">
              {product.price.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-3 flex flex-col gap-6 min-h-screen">
      <div className="">
        <h1 className="text-lg font-bold">Shop Nữ</h1>
        <Swiper
          spaceBetween={16} // Giảm từ 16 xuống 9px
          slidesPerView={3.5}
          breakpoints={{
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 7 },
          }}
          loop={false}
          grabCursor={true}
          className="select-none my-4 border-b-2 border-[#D1D1D1]" // Thêm border-bottom
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <Link
                href={`/products?category=${category.toLowerCase()}`}
                className="text-base text-gray-700 hover:text-black"
              >
                {category}
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex justify-between items-center">
          <p className="desc-text text-[#B0B0B0]">{countProducts(products)} Sản phẩm</p>
          <button className="flex items-center gap-1 py-[0.625rem] px-[0.75rem] text-base font-bold rounded-full border-2">
            Lọc
            <Image
              src="/product/product_filter.svg"
              alt="Mô tả ảnh"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>

      {initialLoading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4 justify-center">
            {displayedProducts.map((product) => (
              <div key={product.id} className="flex justify-center">
                {renderProductCard(product)}
              </div>
            ))}
          </div>
          <div ref={observerRef} className="h-10">
            {loading && (
              <p className="text-center text-gray-500">Đang tải thêm...</p>
            )}
          </div>
          {!hasMore && displayedProducts.length > 0 && (
            <p className="text-center text-gray-500">Đã tải hết sản phẩm!</p>
          )}
        </>
      )}
    </div>
  );
}