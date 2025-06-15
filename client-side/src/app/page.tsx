import FeaturedSection from "@/components/Home/FeaturedSection";
import ProductSection from "@/components/Home/ProductSection";
import MemberBenefitsBanner from "@/components/Home/MemberBenefitsBanner";
import Container from "@/components/Core/Container";
import Banner from "@/components/Home/Banner";
import { fetchProducts } from "@/services/productApi";
import { fetchFeaturedSection } from "@/services/featuredSectionApi";
import { fetchMemberBenefits } from "@/services/memberBenefitApi";
import { IProduct, IFeaturedProducts, IMemberBenefit } from "@/types/product";

async function getHomeData() {
  try {
    const [productsData, featuredSection, benefits] = await Promise.all([
      fetchProducts({ sort: "newest", limit: 20 }),
      fetchFeaturedSection(),
      fetchMemberBenefits(),
    ]);
    return {
      products: productsData.products || [],
      featuredSection: featuredSection || [],
      benefits: benefits || [],
      error: null,
    };
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu trang chủ:", err);
    return {
      products: [],
      featuredSection: [],
      benefits: [],
      error: "Có lỗi xảy ra khi tải dữ liệu trang chủ.",
    };
  }
}

export default async function Home() {
  const { products, featuredSection, benefits, error } = await getHomeData();

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <div className="text-center text-red-500" role="alert">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              aria-label="Thử lại"
            >
              Thử lại
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden flex flex-col gap-14 pb-14"
      role="main"
      aria-label="Trang chủ"
    >
      {/* Banner đầu */}
      <Banner
        status="Vừa ra mắt"
        name="Áo khoác Gopcore Basic"
        description="Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt."
        image1="/banner/banner_1.png"
        image2="/banner/banner_2.png"
        altText="Áo khoác Gopcore Basic mới ra mắt"
      />

      <Container className="flex flex-col gap-[3.375rem] w-full">
        {/* Nội dung chính */}
        <FeaturedSection featuredSection={featuredSection} />
        <ProductSection products={products} />
        <MemberBenefitsBanner benefits={benefits} />

        {/* Banner cuối */}
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
