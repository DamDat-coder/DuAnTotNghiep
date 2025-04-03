// src/app/page.tsx
import FeaturedSection from "../components/FeaturedSection";
import { fetchProducts,fetchFeaturedSection } from "../services/api";
import ProductSection from "../components/ProductSection";
import MemberBenefitsBanner from "@/components/MemberBenefitsBanner";

export default async function Home() {
  const products = await fetchProducts();
  const featuredSection = await fetchFeaturedSection();
  

  return (
    <div className="py-0 px-6 desktop:px-0 overflow-x-hidden ">
      {/* Banner đầu */}
      <div className="banner mx-auto w-full max-w-md tablet:max-w-2xl desktop:w-full desktop:max-w-[2560px] desktop:flex desktop:items-center desktop:gap-4">
        {/* Mobile/Tablet: 1 hình */}
        <div className="desktop:hidden">
          <img
            src="/banner/banner_1.png"
            alt="Áo khoác Gopcore Basic"
            className="w-full h-auto object-cover"
          />
          <div className="banner_content flex flex-col items-start justify-evenly gap-3 mt-5">
            <div className="banner_status text-base">Vừa ra mắt</div>
            <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl leading-[1.8125rem] line-clamp-1">
              Áo khoác Gopcore Basic
            </div>
            <div className="banner_description desc-text text-gray-700 tablet:text-lg">
              Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt.
            </div>
          </div>
          <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors mt-5">
            Shop
          </button>
        </div>

        {/* Desktop: 2 hình với overlay */}
        <div className="hidden desktop:flex desktop:w-screen items-center">
          {/* Container cho cả 2 hình */}
          <div className="relative w-full flex">
            {/* Hình 1 */}
            <div className="w-[50%]">
              <img
                src="/banner/banner_1.png"
                alt="Áo khoác Gopcore Basic"
                className="w-full h-[50rem] object-cover"
              />
            </div>
            {/* Hình 2 */}
            <div className="w-[50%]">
              <img
                src="/banner/banner_2.png" // Thêm hình thứ 2, bạn cần cung cấp đường dẫn thực tế
                alt="Áo khoác Gopcore Basic 2"
                className="w-full h-[50rem] object-cover"
              />
            </div>
            {/* Overlay cho toàn bộ hình lớn */}
            <div className="absolute bottom-0 w-full h-[33.33%] bg-gradient-to-b from-transparent to-black flex justify-center items-center">
              <div className="text-white text-center">
                <div className="banner_status text-base">Vừa ra mắt</div>
                <div className="banner_name text-[1.5rem] font-bold desktop:text-3xl leading-[1.8125rem] line-clamp-1">
                  Áo khoác Gopcore Basic
                </div>
                <div className="banner_description desc-text desktop:text-lg">
                  Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác
                  biệt.
                </div>
                <button className="banner_action text-[1rem] px-6 py-2 bg-white text-black font-bold rounded-full hover:opacity-70 transition-colors mt-3">
                  Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="desktop:w-[80%] desktop:mx-auto flex flex-col flex-grow gap-[3.375rem]">
        <div className=""></div>
        <FeaturedSection featuredSection={featuredSection} />
        <ProductSection products={products} />

        {/* Banner cuối */}
        <div className="banner mx-auto w-full max-w-md tablet:max-w-2xl desktop:w-full desktop:max-w-[2560px] desktop:flex desktop:items-center">
          {/* Mobile/Tablet: 1 hình */}
          <div className="desktop:hidden">
            <h1 className="text-[1.5rem] font-bold desktop:text-[1.5rem] desktop:font-bold">
              Đừng Bỏ Lỡ
            </h1>
            <img
              src="/product/product_sale.png"
              alt="Áo khoác Gopcore Basic"
              className="w-full h-auto object-cover mt-5"
            />
            <div className="banner_content flex flex-col items-start justify-evenly gap-3 mt-5">
              <div className="banner_status text-base">Cảm giác thoải mái</div>
              <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl leading-[1.8125rem] line-clamp-1">
                MLB - Áo khoác phối mũ unisex Gopcore Basic
              </div>
              <div className="banner_description desc-text text-gray-700 tablet:text-lg">
                Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế gọn
                gàng thoải mái cùng phong cách biểu tượng.
              </div>
            </div>
            <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors mt-5">
              Shop
            </button>
          </div>

          {/* Desktop: 2 hình với overlay */}
          <div className="hidden  desktop:flex w-full max-w-[2560px] mx-auto flex-col">
            <h1 className="text-[1.5rem] font-bold desktop:text-[1.5rem] desktop:font-bold">
              Đừng Bỏ Lỡ
            </h1>
            <div className="relative w-full flex mt-5">
              {/* Hình 1 */}
              <div className="w-[50%]">
                <img
                  src="/product/product_sale.png"
                  alt="Áo khoác Gopcore Basic"
                  className="w-full h-[50rem] object-cover"
                />
              </div>
              {/* Hình 2 */}
              <div className="w-[50%]">
                <img
                  src="/banner/banner_2.png"
                  alt="Áo khoác Gopcore Basic 2"
                  className="w-full h-[50rem] object-cover"
                />
              </div>
              {/* Overlay cho toàn bộ hình lớn */}
              <div className="absolute bottom-0 w-full h-[33.33%] bg-gradient-to-b from-transparent to-black flex justify-center items-center">
                <div className="text-white text-center">
                  <div className="banner_status text-base">
                    Cảm giác thoải mái
                  </div>
                  <div className="banner_name text-[1.5rem] font-bold desktop:text-3xl leading-[1.8125rem] line-clamp-1">
                    MLB - Áo khoác phối mũ unisex Gopcore Basic
                  </div>
                  <div className="banner_description desc-text desktop:text-lg">
                    Chiếc áo phiên bản mới này mang dáng vẻ cổ điển, thiết kế
                    gọn gàng thoải mái cùng phong cách biểu tượng.
                  </div>
                  <button className="banner_action text-[1rem] px-6 py-2 bg-white text-black font-bold rounded-full hover:opacity-70 transition-colors mt-3">
                    Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MemberBenefitsBanner />
      </div>
    </div>
  );
}
