"use client";

import { useEffect, useState, useRef } from "react";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import ProductDesktopLayout from "@/components/Detail/Layout/ProductDesktopLayout";
import ProductMobileLayout from "@/components/Detail/Layout/ProductMobileLayout";
import {
  fetchProductById,
  recommendProducts,
  fetchProducts,
} from "@/services/productApi";
import { IProduct } from "@/types/product";

// Định nghĩa kiểu RecommendResponse
interface RecommendResponse {
  success: boolean;
  outfits?: any[];
  data: IProduct[];
}

export function ProductContent({ id }: { id: string }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(true);
  const cache = useRef<{ [key: string]: IProduct[] }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Lấy chi tiết sản phẩm
        console.log("Gọi fetchProductById với id:", id);
        const prod = await fetchProductById(id);
        if (!prod) throw new Error("Không tìm thấy sản phẩm.");
        console.log("Kết quả từ fetchProductById:", prod);
        setProduct(prod);

        const cacheKey = `viewed_${id}`;
        if (cache.current[cacheKey]) {
          console.log("Lấy suggestedProducts từ cache:", cache.current[cacheKey]);
          setSuggestedProducts(cache.current[cacheKey]);
          setIsSuggestedLoading(false);
          return;
        }

        // Bước 1: Gọi fetchProducts trước (nhanh hơn)
        console.log("Gọi fetchProducts (fallback)");
        const fallbackProducts = await fetchProducts({
          sort_by: "best_selling",
          is_active: true,
          limit: 5,
        });
        console.log("Kết quả từ fetchProducts:", fallbackProducts.data);
        cache.current[cacheKey] = fallbackProducts.data || [];
        setSuggestedProducts(fallbackProducts.data || []);
        setIsSuggestedLoading(false);

        // Bước 2: Gọi recommendProducts với timeout 10 giây
        const userBehavior = {
          viewed: [id],
          cart: [],
        };
        console.log("Gửi yêu cầu recommendProducts với:", userBehavior);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout: recommendProducts quá lâu")), 10000);
        });

        const recommendPromise = recommendProducts(userBehavior);
        const response = (await Promise.race([recommendPromise, timeoutPromise])) as unknown as RecommendResponse;

        // Chỉ cập nhật nếu recommendProducts trả về dữ liệu hợp lệ
        if (response && response.success && response.data && response.data.length > 0) {
          console.log("Kết quả từ recommendProducts:", response.data);
          cache.current[cacheKey] = response.data;
          setSuggestedProducts(response.data);
        } else {
          console.log("recommendProducts không trả về dữ liệu hợp lệ, giữ dữ liệu từ fetchProducts");
        }
      } catch (err: any) {
        console.error("Có lỗi xảy ra khi tải dữ liệu:", err);
        if (!product) {
          console.error(err.message || "Không tìm thấy sản phẩm.");
        } else if (!cache.current[`viewed_${id}`]) {
          console.error("Lỗi khi lấy sản phẩm gợi ý.");
          setSuggestedProducts([]);
        } else {
          console.log("Giữ dữ liệu từ fetchProducts, không hiển thị lỗi gợi ý");
        }
      } finally {
        setIsSuggestedLoading(false);
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

  // Log debug trước khi render
  console.log("isSuggestedLoading:", isSuggestedLoading);
  console.log("suggestedProducts:", suggestedProducts);

  return (
    <div className="min-h-screen pb-14">
      <Container>
        <Breadcrumb />

        {/* Mobile layout */}
        {isSuggestedLoading ? (
          <div className="sk-chase" role="status" aria-label="Đang tải">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        ) : (
          <ProductMobileLayout
            product={product}
            sizes={sizes}
            stock={stock}
            suggestedProducts={suggestedProducts}
            isOutOfStock={isOutOfStock}
          />
        )}

        {/* Desktop layout */}
        <div className="hidden tablet:flex tablet:flex-row tablet:gap-12 w-full">
          {isSuggestedLoading ? (
            <div className="sk-chase" role="status" aria-label="Đang tải">
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
              <div className="sk-chase-dot"></div>
            </div>
          ) : (
            <ProductDesktopLayout
              product={product}
              sizes={sizes}
              stock={stock}
              suggestedProducts={suggestedProducts}
              isOutOfStock={isOutOfStock}
            />
          )}
        </div>
      </Container>
    </div>
  );
}