// src/components/ProductGrid.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterPopup from "../Products/FilterPopup";
import { IProduct } from "@/types";

interface ProductGridProps {
  products: IProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    products.slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length > 10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [likedProducts, setLikedProducts] = useState<{
    [key: string]: boolean;
  }>({});
  const observerRef = useRef<HTMLDivElement | null>(null);

  const PRODUCTS_PER_PAGE = 10;

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("likedProducts") || "{}");
    setLikedProducts(savedLikes);
  }, []);

  useEffect(() => {
    localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
  }, [likedProducts]);

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
    const nextProducts = products.slice(
      currentLength,
      currentLength + PRODUCTS_PER_PAGE
    );

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      const newLength = currentLength + nextProducts.length;
      setHasMore(newLength < products.length);
      setLoading(false);
    }, 500);
  };

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const renderProductCard = (product: IProduct) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);
    const isLiked = likedProducts[product.id] || false;

    return (
      <Link
        href={`/products/${product.id}`}
        className="product w-full h-auto desktop:w-full flex flex-col bg-white relative"
      >
        <Image
          src={`/product/img/${product.image[0]}`}
          alt={product.name || "Sản phẩm"}
          width={171}
          height={269}
          className="w-[171px] h-[269px] desktop:w-full desktop:h-[450px] object-cover"
          draggable={false}
          loading="lazy"
        />
        <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] desktop:text-[0.875rem] font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </div>
        <button
          className="absolute top-[0.5rem] right-[0.5rem]"
          onClick={(e) => {
            e.preventDefault();
            toggleLike(product.id);
          }}
        >
          <img
            src={
              isLiked
                ? "/product/product_like_active.svg"
                : "/product/product_like.svg"
            }
            alt={isLiked ? "Đã thích" : "Thích"}
          />
        </button>
        <div className="content flex flex-col p-4">
          <div className="name h-20 text-lg desktop:text-lg font-bold text-[#374151] line-clamp-2">
            {product.name || "Sản phẩm"}
          </div>
          <div className="category desc-text text-[#374151] truncate">
            {product.category || "Danh mục"}
          </div>
          <div className="price-container flex items-center gap-3 pt-2">
            <div className="discountPrice text-[1rem] desktop:text-[1.125rem] font-bold text-red-500">
              {discountPrice.toLocaleString("vi-VN")}₫
            </div>
            <div className="price text-[0.875rem] desktop:text-[1rem] text-[#374151] line-through">
              {product.price.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="desc-text text-[#B0B0B0]">{products.length} Sản phẩm</p>
        <button
          className="flex items-center gap-1 py-[0.625rem] px-[0.75rem] text-base font-bold rounded-full border-2"
          onClick={() => setIsFilterOpen(true)}
        >
          Lọc sản phẩm
          <Image
            src="/product/product_filter.svg"
            alt="Mô tả ảnh"
            width={16}
            height={16}
          />
        </button>
      </div>
      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-4 desktop:grid-cols-4 justify-center overflow-x-hidden pt-2">
        {displayedProducts.map((product) => (
          <div key={product.id} className="w-full">
            {renderProductCard(product)}
          </div>
        ))}
      </div>
      <div ref={observerRef} className={`h-10 ${!hasMore ? "hidden" : ""}`}>
        {loading && (
          <p className="text-center text-gray-500">Đang tải thêm...</p>
        )}
      </div>
      <FilterPopup isOpen={isFilterOpen} setIsOpen={setIsFilterOpen} />
    </>
  );
}