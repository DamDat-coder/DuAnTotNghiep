import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IProduct } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductSwiperProps {
  products: IProduct[];
  slidesPerView: number;
  onAddToCart: (product: IProduct, e: React.MouseEvent) => void;
  onBuyNow: (product: IProduct, e: React.MouseEvent) => void;
}

export default function ProductSwiper({
  products,
  slidesPerView,
  onAddToCart,
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
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
