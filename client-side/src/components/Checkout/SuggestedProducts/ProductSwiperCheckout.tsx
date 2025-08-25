import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IProduct } from "@/types/product";
import ProductCardCheckout from "./ProductCardCheckout";

interface ProductSwiperProps {
  products: IProduct[];
  slidesPerView: number;
  onBuyNow: (product: IProduct, e: React.MouseEvent) => void;
}

export default function ProductSwiper({
  products,
  slidesPerView,
  onBuyNow,
}: ProductSwiperProps) {
  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={slidesPerView}
      loop={false}
      grabCursor={true}
      className="select-none"
      role="list"
    >
      {products.map((product, index) => (
        <SwiperSlide key={product.id || index} role="listitem">
          <ProductCardCheckout
            product={product}
            onBuyNow={onBuyNow}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
