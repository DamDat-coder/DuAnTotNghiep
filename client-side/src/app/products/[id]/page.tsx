// app/products/[id]/page.tsx
import { fetchProductById, fetchProducts } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";
import { IProduct } from "@/types/product";
import { ICategory } from "@/types/category";
import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import ProductImageSwiper from "@/components/Detail/ProductImageSwiper";
import ProductActions from "@/components/Detail/ProductActions";
import ProductDetailsSection from "@/components/Detail/ProductDetailsSection";
import ProductSection from "@/components/Home/ProductSection";
import { Star } from "lucide-react";
import DesktopImageGalleryWrapper from "@/components/Detail/DesktopImageGalleryWrapper";

interface ProductDetailProps {
  params: { id: string };
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const { id } = await params;

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
    <div className="min-h-screen pb-14">
      <Container>
        <Breadcrumb />

        <div className="mt-4 flex flex-col tablet:flex-row tablet:gap-6 desktop:flex-row desktop:gap-6 laptop:flex-row laptop:gap-6 px-4">
          {/* Mobile/Tablet: Toàn bộ layout gốc */}
          <div className="flex flex-col gap-9 tablet:hidden laptop:hidden desktop:hidden">
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
                  images={product.images.filter(
                    (img): img is string => typeof img === "string"
                  )}
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
              <ProductSection
                products={allProducts}
                desktopSlidesPerView={2.5}
              />
            </div>
          </div>

          {/* Desktop: Container 1 (Ảnh, Section 4, Section 5) */}
          <div className="hidden tablet:flex tablet:flex-col tablet:w-3/5 desktop:flex desktop:flex-col desktop:w-3/4 laptop:flex laptop:flex-col laptop:w-2/3 overflow-x-hidden">
            <DesktopImageGalleryWrapper
              images={product.images.filter(
                (img): img is string => typeof img === "string"
              )}
              productName={product.name}
            />

            {/* Section 4: Chi tiết sản phẩm, Kích thước, Đánh giá */}
            <ProductDetailsSection />

            {/* Section 5: Sản phẩm gợi ý */}
            <div className="mb-4 mt-9">
              <ProductSection
                products={allProducts}
                desktopSlidesPerView={3.2}
              />
            </div>
          </div>

          {/* Desktop: Container 2 (Thông tin Sticky) */}
          <div className="hidden desktop:block desktop:sticky desktop:top-0 desktop:self-start desktop:w-1/4 gap-16  laptop:block laptop:sticky laptop:top-0 laptop:self-start laptop:w-1/3  tablet:block tablet:sticky tablet:top-0 tablet:self-start tablet:w-2/5 pb-20">
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
      </Container>
    </div>
  );
}
