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
import { IProduct, IFeaturedProducts, IMemberBenefit } from "@/types/product";

// Quy định kiểu dữ liệu
type Product = IProduct;
type FeaturedSectionType = IFeaturedProducts;
type Benefit = IMemberBenefit;

type HomeData = {
  products: Product[];
  featuredSection: FeaturedSectionType[];
  benefits: Benefit[];
  error: string | null;
};

// Lấy dữ liệu
async function getHomeData(): Promise<HomeData> {
  try {
    const [productsData, featuredSection, benefits] = await Promise.all([
      fetchProducts({ sort_by: "best_selling", is_active: true }),
      fetchFeaturedSection(),
      fetchMemberBenefits(),
    ]);

    return {
      products: Array.isArray(productsData?.data) ? productsData.data : [],
      featuredSection: featuredSection || [],
      benefits: benefits || [],
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
      error: "Có lỗi xảy ra khi tải dữ liệu trang chủ.",
    };
  }
}

// PAGE COMPONENT
export default async function Home() {
  const { products, featuredSection, benefits } = await getHomeData();

  return (
    <div
      className="overflow-x-hidden flex flex-col gap-14 pb-14"
      role="main"
      aria-label="Trang chủ"
    >
      <Toaster position="top-right" />

      {/* Banner chính */}
      <Banner
        status="Vừa ra mắt"
        name="Áo khoác Gopcore Basic"
        description="Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt."
        image1="/banner/banner_1.png"
        image2="/banner/banner_2.png"
        altText="Áo khoác Gopcore Basic mới ra mắt"
      />

      <Container className="flex flex-col gap-[3.375rem] w-full">
        {/* Khu vực nổi bật */}
        <FeaturedSection featuredSection={featuredSection} />

        {/* Sản phẩm mới */}
        <ProductSection products={products} />

        {/* Quyền lợi thành viên */}
        <MemberBenefitsBanner benefits={benefits} />

        {/* Banner phụ (desktop) */}
        <div className="hidden laptop:flex desktop:flex w-full flex-col flex-grow gap-[3.375rem]">
          <Banner
            title="Đừng Bỏ Lỡ"
            status="Cảm giác thoải mái"
            name="MLB - Áo khoác phối mũ unisex Gopcore Basic"
            description="Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng thoải mái cùng phong cách biểu tượng."
            image1="/product/product_sale.png"
            image2="/banner/banner_2.png"
            altText="Áo khoác MLB Gopcore Basic khuyến mãi"
          />
        </div>
      </Container>

      {/* Banner phụ (mobile) */}
      <div className="flex flex-col tablet:flex laptop:hidden desktop:hidden">
        <Banner
          title="Đừng Bỏ Lỡ"
          status="Cảm giác thoải mái"
          name="MLB - Áo khoác phối mũ unisex Gopcore Basic"
          description="Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng thoải mái cùng phong cách biểu tượng."
          image1="/product/product_sale.png"
          image2="/banner/banner_2.png"
          altText="Áo khoác MLB Gopcore Basic khuyến mãi"
        />
      </div>
    </div>
  );
}
