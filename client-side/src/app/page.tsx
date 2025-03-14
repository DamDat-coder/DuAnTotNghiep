import Header from "../components/Header";
import Footer from "../components/Footer";
import FeaturedSection from "../components/FeaturedSection";
import { fetchProducts } from "../services/api";
import { Product } from "../types";
import ProductSection from "../components/ProductSection";

// Server Component (App Router)
export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Trang Chủ" />
      <main className="home_main flex flex-col flex-grow gap-[3.375rem]">
        {/* <Banner /> */}
        <div className="banner flex flex-col items-start justify-evenly gap-5 px-6 py-0 max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
          {/* Hình ảnh banner */}
          <img
            src="/banner/banner_1.png"
            alt="Áo khoác Gopcore Basic"
            className="w-full h-auto object-cover"
          />
          <div className="banner_content flex-col items-start justify-evenly gap-3">
            <div className="banner_status text-base">Vừa ra mắt</div>

            {/* Tên sản phẩm */}
            <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl desktop:text-3xl">
              Áo khoác Gopcore Basic
            </div>

            {/* Mô tả sản phẩm */}
            <div className="banner_description text-base text-gray-700 tablet:text-lg">
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
      </main>
      <br />
      {/* <Footer /> */}
    </div>
  );
}
