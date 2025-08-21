"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import ProductDesktopLayout from "@/components/Detail/Layout/ProductDesktopLayout";
import ProductMobileLayout from "@/components/Detail/Layout/ProductMobileLayout";
import { fetchProductById, recommendProducts } from "@/services/productApi"; // Thêm recommendProducts
import { IProduct } from "@/types/product";

export function ProductContent({ id }: { id: string }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Lấy chi tiết sản phẩm
        const prod = await fetchProductById(id);
        if (!prod) throw new Error("Không tìm thấy sản phẩm.");
        setProduct(prod);

        const userBehavior = {
          viewed: [id],
          cart: [],
        };
        const recommendations = await recommendProducts(userBehavior);
        setSuggestedProducts(recommendations.data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu.");
      }
    }

    fetchData();
  }, [id]);

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg text-red-500">
          {error || "Không tìm thấy sản phẩm."}
        </p>
      </div>
    );
  }

  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).map(
    (size) => ({
      value: size,
      inStock: product.variants.some((v) => v.size === size && v.stock > 0),
    })
  );

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const isOutOfStock = product.variants.every((v) => Number(v.stock) === 0);

  return (
    <div className="min-h-screen pb-14">
      <Container>
        <Breadcrumb />

        {/* Mobile layout */}
        <ProductMobileLayout
          product={product}
          sizes={sizes}
          stock={stock}
          suggestedProducts={suggestedProducts}
          isOutOfStock={isOutOfStock}
        />

        {/* Desktop layout */}
        <div className="hidden tablet:flex tablet:flex-row tablet:gap-12 w-full">
          <ProductDesktopLayout
            product={product}
            sizes={sizes}
            stock={stock}
            suggestedProducts={suggestedProducts}
            isOutOfStock={isOutOfStock}
          />
        </div>
      </Container>
    </div>
  );
}