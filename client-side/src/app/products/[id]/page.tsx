// app/products/[id]/page.tsx
import { Suspense } from "react";
import { fetchProductById, fetchProducts, fetchCategories } from "@/services/api";
import { ICategory, IProduct } from "@/types";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import ProductImageSwiper from "@/components/Detail/ProductImageSwiper";
import ProductActions from "@/components/Detail/ProductActions";
import ProductDetailsSection from "@/components/Detail/ProductDetailsSection";
import ProductSection from "@/components/Home/ProductSection";
import Image from "next/image";
import { Star } from "lucide-react";

interface ProductDetailProps {
  params: { id: string };
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const  { id } = await params;

  let product: IProduct | null = null;
  let suggestedProducts: ICategory[] = [];
  let allProducts: IProduct[] = [];
  let error: string | null = null;

  try {
    product = await fetchProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm.");
    suggestedProducts = await fetchCategories();
    allProducts = await fetchProducts();
  } catch (err) {
    error = "Có lỗi xảy ra khi tải dữ liệu.";
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg text-red-500">
          {error || "Không tìm thấy sản phẩm."}
        </p>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercent / 100);
  const sizes = [
    { value: "S", inStock: true },
    { value: "M", inStock: true },
    { value: "L", inStock: true },
    { value: "XL", inStock: true },
    { value: "2XL", inStock: true },
    { value: "3XL", inStock: false },
  ];
  const stock = 1;

  return (
    <div className="min-h-screen">
      <Container>
        <Breadcrumb />
      </Container>

      <div className="mt-4 flex flex-col desktop:flex-row desktop:gap-6">
        {/* Mobile/Tablet: Toàn bộ layout gốc */}
        <div className="flex flex-col gap-9 desktop:hidden">
          {/* Section 1: Thông tin cơ bản và Swiper */}
          <div>
            <div className="mt-4 flex flex-col items-start gap-4">
              <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
              <div className="flex items-center gap-4">
                <div className="text-red-500 font-bold text-lg">
                  {discountedPrice.toLocaleString()}đ
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString()}đ
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <ProductImageSwiper
                images={product.image}
                productName={product.name}
              />
            </div>
          </div>

          {/* Section 2 & 3: Sizes và Actions */}
          <ProductActions
            product={product}
            sizes={sizes}
            stock={stock}
            discountedPrice={discountedPrice}
          />

          {/* Section 4: Chi tiết sản phẩm, Kích thước, Đánh giá */}
          <ProductDetailsSection />

          {/* Section 5: Sản phẩm gợi ý */}
          <div className="mb-4">
            <ProductSection products={allProducts} desktopSlidesPerView={3.2} />
          </div>
        </div>

        {/* Desktop: Container 1 (Ảnh, Section 4, Section 5) */}
        <div className="hidden desktop:flex desktop:flex-col desktop:w-3/4 overflow-x-hidden">
          <div className="relative">
            <div className="grid grid-cols-2 gap-0">
              {product.image.slice(0, 4).map((image, index) => (
                <Image
                  key={index}
                  src={`/product/img/${image}`}
                  alt={`${product.name} - Ảnh ${index + 1}`}
                  width={380}
                  height={285}
                  className="w-full h-auto object-cover"
                />
              ))}
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-2 py-2 px-4 border-2 border-black border-solid w-[15%] bg-white">
              <button className="text-base font-bold">XEM THÊM</button>
              <Image
                src="/nav/footer_down.svg"
                alt="Xem thêm"
                width={16}
                height={16}
              />
            </div>
          </div>

          {/* Section 4: Chi tiết sản phẩm, Kích thước, Đánh giá */}
          <ProductDetailsSection />

          {/* Section 5: Sản phẩm gợi ý */}
          <div className="mb-4 mt-9 desktop:w-[80%] desktop:mx-auto">
            <ProductSection products={allProducts} desktopSlidesPerView={3.2} />
          </div>
        </div>

        {/* Desktop: Container 2 (Thông tin Sticky) */}
        <div className="hidden desktop:block desktop:sticky desktop:top-0 desktop:self-start desktop:w-1/4 gap-16 desktop:px-[3.75rem] desktop:py-[1.875rem]">
          <div className="mt-4 flex flex-col items-start gap-6">
            <div className="w-full flex justify-between">
              <div className="text-sm font-bold opacity-40">
                {product.category}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="black" stroke="black" />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
            <div className="flex items-center gap-4">
              <div className="text-red-500 font-bold text-lg">
                {discountedPrice.toLocaleString()}đ
              </div>
              <div className="text-sm text-gray-500 line-through">
                {product.price.toLocaleString()}đ
              </div>
            </div>
          </div>

          {/* Section 2 & 3: Sizes và Actions */}
          <ProductActions
            product={product}
            sizes={sizes}
            stock={stock}
            discountedPrice={discountedPrice}
          />
        </div>
      </div>
    </div>
  );
}