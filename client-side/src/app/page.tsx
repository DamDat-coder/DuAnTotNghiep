// src/app/page.tsx
import FeaturedSection from "@/components/Home/FeaturedSection";
import {
  fetchProducts,
  fetchFeaturedSection,
  fetchMemberBenefits,
} from "@/services/api";
import ProductSection from "@/components/Home/ProductSection";
import MemberBenefitsBanner from "@/components/Home/MemberBenefitsBanner";
import Container from "@/components/Core/Container";
import Banner from "@/components/Home/Banner";
import { IProduct, IFeaturedProducts, IMemberBenefit } from "@/types";

export default async function Home() {
  let products: IProduct[] = [];
  let featuredSection: IFeaturedProducts[] = [];
  let benefits: IMemberBenefit[] = [];
  let error = null;

  try {
    products = await fetchProducts();
    featuredSection = await fetchFeaturedSection();
    benefits = await fetchMemberBenefits();
  } catch (err) {
    error = "Có lỗi xảy ra khi tải dữ liệu trang chủ.";
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
    <div className="py-0 px-6 desktop:px-0 overflow-x-hidden flex flex-col gap-4">

        {/* Banner đầu */}
        <Banner
          status="Vừa ra mắt"
          name="Áo khoác Gopcore Basic"
          description="Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt."
          image1="/banner/banner_1.png"
          image2="/banner/banner_2.png"
          altText="Áo khoác Gopcore Basic"
        />
      <Container className="flex flex-col gap-4 w-full">
        {/* Nội dung chính */}
        <FeaturedSection featuredSection={featuredSection} />
        <ProductSection products={products} />
        <MemberBenefitsBanner benefits={benefits} />

        {/* Banner cuối */}
        <div className="flex flex-col flex-grow gap-[3.375rem]">
          <Banner
            title="Đừng Bỏ Lỡ"
            status="Cảm giác thoải mái"
            name="MLB - Áo khoác phối mũ unisex Gopcore Basic"
            description="Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng thoải mái cùng phong cách biểu tượng."
            image1="/product/product_sale.png"
            image2="/banner/banner_2.png"
            altText="Áo khoác Gopcore Basic"
          />
        </div>
      </Container>
    </div>
  );
}