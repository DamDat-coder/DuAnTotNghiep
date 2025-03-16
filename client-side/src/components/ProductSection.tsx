"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { Product } from "../types";

interface ProductSectionProps {
  products: Product[];
}

export default function ProductSection({ products }: ProductSectionProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(products.slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length > 5);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const PRODUCTS_PER_PAGE = 5;

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreProducts();
        }
      },
      { rootMargin: "600px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, displayedProducts]);

  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = products.slice(currentLength, currentLength + PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      const newLength = currentLength + nextProducts.length;
      setHasMore(newLength < products.length);
      setLoading(false);
    }, 500);
  };

  if (!products || products.length === 0) {
    return (
      <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl"> {/* Xóa px-4 */}
        <p className="text-center text-gray-500">Không có sản phẩm nào để hiển thị.</p>
      </div>
    );
  }

  const renderProductCard = (product: Product) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="product w-[16.8125rem] h-[23.875rem] flex flex-col bg-white shadow-xl relative">
        <Image
          src={`/featured/${product.image}`}
          alt={product.name || "Sản phẩm"}
          width={269}
          height={269}
          className="w-[16.8125rem] h-[16.8125rem] object-cover"
          draggable={false}
        />
        <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </div>
        <button className="absolute top-[0.5rem] right-[0.5rem]">
          <img src="/product/product_addToCart.svg" alt="" />
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
    <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl"> {/* Xóa px-4 */}
      <h1 className="text-[1.5rem] pb-6 font-bold">Mới Nhất & Tốt Nhất</h1>
      <div className="block tablet:hidden overflow-x-hidden">
        <div className="max-w-md">
          <Swiper
            spaceBetween={10}
            slidesPerView={1.5}
            loop={false}
            grabCursor={true}
            className="select-none"
          >
            {displayedProducts.map((product) => (
              <SwiperSlide key={product.id} className="!w-[16.8125rem]">
                {renderProductCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      <div className="hidden tablet:block desktop:hidden">
        <div className="grid grid-cols-2 gap-6">
          {displayedProducts.map((product) => (
            <div key={product.id}>{renderProductCard(product)}</div>
          ))}
        </div>
      </div>
      <div className="hidden desktop:block">
        <div className="grid grid-cols-3 gap-6">
          {displayedProducts.map((product) => (
            <div key={product.id}>{renderProductCard(product)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}