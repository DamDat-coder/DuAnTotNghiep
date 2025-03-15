import Header from "../components/Header";
import Footer from "../components/Footer";
import FeaturedSection from "../components/FeaturedSection";
import { fetchProducts } from "../services/api";
import { Product } from "../types";
import ProductSection from "../components/ProductSection";
import MemberBenefitsBanner from "@/components/MemberBenefitsBanner";

// Server Component (App Router)
export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header title="Trang Chủ" />
      <main className="home_main px-6 py-0 flex flex-col flex-grow gap-[3.375rem]">
        {/* <Banner /> */}
        <div className="banner flex flex-col items-start justify-evenly gap-5  max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
          {/* Hình ảnh banner */}
          <img
            src="/banner/banner_1.png"
            alt="Áo khoác Gopcore Basic"
            className="w-full h-auto object-cover"
          />
          <div className="banner_content flex-col items-start justify-evenly gap-3">
            <div className="banner_status text-base">Vừa ra mắt</div>

            {/* Tên sản phẩm */}
            <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl desktop:text-3xl leading-[1.8125rem] line-clamp-1">
              Áo khoác Gopcore Basic
            </div>

            {/* Mô tả sản phẩm */}
            <div className="banner_description desc-text text-gray-700 tablet:text-lg">
              Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt.
            </div>
          </div>

          {/* Nút hành động */}
          <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors">
            Shop
          </button>
        </div>
        <FeaturedSection products={products} />
        <ProductSection products={products} />
        <div className="banner flex flex-col items-start justify-evenly gap-5  max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
          <h1 className="text-[1.5rem]  font-bold">Đừng Bỏ Lỡ</h1>
          {/* Hình ảnh banner */}
          <img
            src="/product/product_sale.png"
            alt="Áo khoác Gopcore Basic"
            className="w-full h-auto object-cover"
          />
          <div className="banner_content flex-col items-start justify-evenly gap-3">
            <div className="banner_status text-base">Cảm giác thoải mái</div>

            {/* Tên sản phẩm */}
            <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl desktop:text-3xl leading-[1.8125rem] line-clamp-1">
              MLB - Áo khoác phối mũ unisex Gopcore Basic
            </div>

            {/* Mô tả sản phẩm */}
            <div className="banner_description desc-text text-gray-700 tablet:text-lg">
              Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn gàng
              thoải mái cùng phong cách biểu tượng.
            </div>
          </div>

          {/* Nút hành động */}
          <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors">
            Shop
          </button>
        </div>
        <MemberBenefitsBanner/>
      </main>
      <br />
      <Footer />
    </div>
  );
}
