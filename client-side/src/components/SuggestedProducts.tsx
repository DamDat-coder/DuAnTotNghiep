"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { JSX } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  category: string;
};

interface SuggestedProductsProps {
  products: Product[];
  renderProductCard: (product: Product) => JSX.Element;
}

export default function SuggestedProducts({ products, renderProductCard }: SuggestedProductsProps) {
  return (
    <div className="mb-4 mt-9 desktop:w-full">
      <div className="max-w-md mx-auto tablet:max-w-2xl">
        <h1 className="text-[1.5rem] pb-6 font-bold">Có thể bạn thích</h1>
        {/* Mobile: Swiper 1.5 */}
        <div className="block tablet:hidden overflow-x-hidden">
          <div className="max-w-md">
            <Swiper
              spaceBetween={10}
              slidesPerView={1.5}
              loop={false}
              grabCursor={true}
              className="select-none"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id} className="!w-[22.6875rem]">
                  {renderProductCard(product)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        {/* Tablet: Grid 2 cột */}
        <div className="hidden tablet:block desktop:hidden">
          <div className="grid grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id}>{renderProductCard(product)}</div>
            ))}
          </div>
        </div>
        {/* Desktop: Swiper 3 cột */}
        <div className="hidden desktop:block">
          <div className="w-full">
            <Swiper
              spaceBetween={200}
              slidesPerView={3}
              loop={false}
              grabCursor={true}
              className="select-none w-full"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>{renderProductCard(product)}</SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}