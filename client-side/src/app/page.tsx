export const dynamic = "force-dynamic";

import FeaturedSection from "@/components/Home/FeatureSection/FeaturedSection";
import ProductSection from "@/components/Home/ProductSection/ProductSection";
import MemberBenefitsBanner from "@/components/Home/MemberBenefits/MemberBenefitsBanner";
import Container from "@/components/Core/Container";
import Banner from "@/components/Home/Banner/Banner";
import { fetchProducts } from "@/services/productApi";
import { fetchFeaturedSection } from "@/services/featuredSectionApi";
import { fetchMemberBenefits } from "@/services/memberBenefitApi";
import { Toaster } from "react-hot-toast";
import type { IProduct, IFeaturedProducts, IMemberBenefit } from "@/types/product";

type Product = IProduct;
type FeaturedSectionType = IFeaturedProducts;
type Benefit = IMemberBenefit;

type HomeData = {
  products: Product[];
  featuredSection: FeaturedSectionType[];
  benefits: Benefit[];
  newestProducts: Product[];
  error: string | null;
};

async function getHomeData(): Promise<HomeData> {
  try {
    const [productsData, featuredSection, benefits, newestProductsData] =
      await Promise.all([
        fetchProducts({ sort_by: "best_selling", is_active: true }),
        fetchFeaturedSection(),
        fetchMemberBenefits(),
        fetchProducts({ sort_by: "newest", is_active: true, limit: 2 }),
      ]);

    return {
      products: Array.isArray(productsData?.data) ? productsData.data : [],
      featuredSection: featuredSection || [],
      benefits: benefits || [],
      newestProducts: Array.isArray(newestProductsData?.data)
        ? newestProductsData.data
        : [],
      error: null,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Lỗi khi tải dữ liệu trang chủ:", err);
    }
    return {
      products: [],
      featuredSection: [],
      benefits: [],
      newestProducts: [],
      error: "Có lỗi xảy ra khi tải dữ liệu trang chủ.",
    };
  }
}

export default async function Home() {
  const { products, featuredSection, benefits, newestProducts } =
    await getHomeData();

  const topBannerProduct = newestProducts[0] || ({} as Partial<Product>);
  const bottomBannerProduct = newestProducts[1] || ({} as Partial<Product>);

  const topBannerImages: string[] =
    Array.isArray(topBannerProduct.images) && topBannerProduct.images.length > 0
      ? topBannerProduct.images.slice(0, 4)
      : ["/banner/banner_1.png", "/banner/banner_2.png"];

  const bottomBannerImages: string[] =
    Array.isArray(bottomBannerProduct.images) && bottomBannerProduct.images.length > 0
      ? bottomBannerProduct.images.slice(0, 4)
      : ["/product/product_sale.png", "/banner/banner_2.png"];

  return (
    <div
      className="overflow-x-hidden flex flex-col gap-14 pb-14"
      role="main"
      aria-label="Trang chủ"
    >
      <Toaster position="top-right" />

      {/* Banner chính */}
      <Banner
        id={(topBannerProduct as any)?.id || ""}
        status="Vừa ra mắt"
        name={topBannerProduct.name || "Áo khoác Gopcore Basic"}
        description={
          topBannerProduct.description ||
          "Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt."
        }
        images={topBannerImages}
        altText={`Banner ${
          topBannerProduct.name || "Áo khoác Gopcore Basic"
        } mới ra mắt`}
      />

      <Container className="flex flex-col gap-[3.375rem] w-full">
        {/* Khu vực nổi bật */}
        <FeaturedSection featuredSection={featuredSection} />

        {/* Sản phẩm bán chạy */}
        <ProductSection products={products} />

        {/* Quyền lợi thành viên */}
        <MemberBenefitsBanner benefits={benefits} />

        {/* Banner phụ (desktop) */}
        <div className="hidden laptop:flex desktop:flex w-full flex-col flex-grow gap-[3.375rem]">
          <Banner
            id={(bottomBannerProduct as any)?.id || ""}
            title="Đừng Bỏ Lỡ"
            status="Cảm giác thoải mái"
            name={
              bottomBannerProduct.name ||
              "MLB - Áo khoác phối mũ unisex Gopcore Basic"
            }
            description={
              bottomBannerProduct.description ||
              "Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng thoải mái cùng phong cách biểu tượng."
            }
            images={bottomBannerImages}
            altText={`Banner ${
              bottomBannerProduct.name || "Áo khoác MLB Gopcore Basic"
            } khuyến mãi`}
          />
        </div>
      </Container>

      {/* Banner phụ (mobile) */}
      <div className="flex flex-col tablet:flex laptop:hidden desktop:hidden">
        <Banner
          id={(bottomBannerProduct as any)?.id || ""}
          title="Đừng Bỏ Lỡ"
          status="Cảm giác thoải mái"
          name={
            bottomBannerProduct.name ||
            "MLB - Áo khoác phối mũ unisex Gopcore Basic"
          }
          description={
            bottomBannerProduct.description ||
            "Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng thoải mái cùng phong cách biểu tượng."
          }
          images={bottomBannerImages}
          altText={`Banner ${
            bottomBannerProduct.name || "Áo khoác MLB Gopcore Basic"
          } khuyến mãi`}
        />
      </div>
    </div>
  );
}
