// src/components/Home/ProductGrid.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterPopup from "../Products/FilterPopup";
import { IProduct } from "@/types/product";
import AddToCartButton from "../Cart/AddToCartButton";
import BuyNowPopup from "../Core/Layout/BuyNowButton/BuyNowPopup";

interface ProductGridProps {
  products: IProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    products.slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length > 10);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const PRODUCTS_PER_PAGE = 10;

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
    }, 600);
  };

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  const renderProductCard = (product: IProduct) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className=" w-full flex flex-col bg-white relative">
        <div className="product w-full h-auto font-description">
          <Image
            src={`/product/img/${product.images[0]}`}
            alt={product.name || "Sản phẩm"}
            width={363}
            height={363}
            className="w-full h-[16.8125rem] laptop:h-[18.3125rem] desktop:h-[18.3125rem] object-cover"
            draggable={false}
          />
          <div
            className={`absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded ${
              !product.discountPercent ? "hidden" : "block"
            } `}
          >
            -{product.discountPercent}%
          </div>
          <AddToCartButton product={product} />
          <div className="content flex flex-col py-4 gap-3">
            <div>
              <div className="name text-base tablet:text-lg laptop:text-lg desktop:text-lg font-bold text-[#374151] pb-2 two-line-clamp h-[3rem] tablet:h-[3.5rem] laptop:h-[3.5rem] desktop:h-[3.5rem]">
                {product.name || "Sản phẩm"}
              </div>
              <div className="category text-base text-[#374151] truncate">
                {product.category || "Danh mục"}
              </div>
            </div>
            <div className="price-container flex items-center gap-3">
              <div className="discountPrice text-[1rem] font-bold text-red-500">
                {discountPrice.toLocaleString("vi-VN")}₫
              </div>
              <div
                className={`price text-[0.875rem] flex items-center text-[#374151] line-through ${
                  !product.discountPercent ? "hidden" : "block"
                }`}
              >
                {product.price.toLocaleString("vi-VN")}₫
              </div>
            </div>
            <div className="flex gap-3 font-heading">
              <Link
                href={`/products/${product.id}`}
                className="p-3 border-solid border-black border-2 rounded text-base"
              >
                Xem chi tiết
              </Link>
              <button
                onClick={(e) => handleBuyNow(product, e)}
                className="p-3 border-solid border-black border-2 rounded text-white bg-black font-bold text-base"
                aria-label={`Mua ngay sản phẩm ${product.name}`}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-4 desktop:grid-cols-4  laptop:grid-cols-4 justify-center overflow-x-hidden pt-2">
        {displayedProducts.map((product) => (
          <div key={product.id} className="w-full">
            {renderProductCard(product)}
          </div>
        ))}
      </div>
      <div ref={observerRef} className={`h-10 ${!hasMore ? "hidden" : ""}`}>
        {loading && (
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        )}
      </div>
      <FilterPopup isOpen={isFilterOpen} setIsOpen={setIsFilterOpen} />
      {selectedProduct && (
        <BuyNowPopup
          product={selectedProduct}
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}
