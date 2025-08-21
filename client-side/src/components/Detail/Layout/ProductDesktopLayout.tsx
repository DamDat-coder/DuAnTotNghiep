import { useState } from "react";
import { useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types/product";
import DesktopImageGalleryWrapper from "../ImageGallery/DesktopImageGalleryWrapper";
import ProductActions from "../ProductAction/ProductActions";
import ProductDetailsSection from "../DetailSection/ProductDetailsSection";
import ProductMainInfo from "../ProductAction/ProductMainInfo";
import AddToCartPopup from "../../Cart/AddToCart/AddToCartPopup";
import BuyNowPopup from "../../Core/Layout/BuyNowButton/BuyNowPopup";
import { Suspense } from "react";
import toast from "react-hot-toast";
import ProductSwiper from "@/components/Home/ProductSection/ProductSwiper";

export default function ProductDesktopLayout({
  product,
  sizes,
  stock,
  suggestedProducts,
  isOutOfStock,
}: {
  product: IProduct;
  sizes: { value: string; inStock: boolean }[];
  stock: number;
  suggestedProducts: IProduct[];
  isOutOfStock: boolean;
}) {
  const dispatch = useCartDispatch();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isBuyNowPopupOpen, setIsBuyNowPopupOpen] = useState(false);
  const [isAddToCartPopupOpen, setIsAddToCartPopupOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = (selectedProduct: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(selectedProduct);
    setIsAddToCartPopupOpen(true);
  };

  // Hàm xử lý mua ngay
  const handleBuyNow = (selectedProduct: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(selectedProduct);
    setIsBuyNowPopupOpen(true);
  };

  return (
    <>
      {/* Left Column */}
      <div className="hidden overflow-hidden tablet:flex tablet:flex-col tablet:w-3/5 desktop:flex desktop:flex-col desktop:w-3/4 laptop:flex laptop:flex-col laptop:w-2/3 overflow-x-hidden">
        <DesktopImageGalleryWrapper
          images={product.images.filter(
            (img): img is string => typeof img === "string"
          )}
          productName={product.name}
          isOutOfStock={isOutOfStock}
          isWishlistOpen={isWishlistOpen}
        />
        <ProductDetailsSection product={product} />
        <div className="mb-4 mt-9">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm gợi ý</h2>
          <ProductSwiper
            products={suggestedProducts}
            slidesPerView={2.5}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden desktop:block desktop:sticky desktop:top-0 desktop:self-start desktop:w-1/4 gap-16 laptop:block laptop:sticky laptop:top-0 laptop:self-start laptop:w-1/3 tablet:block tablet:sticky tablet:top-0 tablet:self-start tablet:w-2/5 pb-20">
        <ProductMainInfo product={product} />
        <ProductActions product={product} sizes={sizes} stock={stock} />
      </div>

      {selectedProduct && (
        <>
          <Suspense fallback={null}>
            <BuyNowPopup
              product={selectedProduct}
              isOpen={isBuyNowPopupOpen}
              onClose={() => {
                setIsBuyNowPopupOpen(false);
                setSelectedProduct(null);
              }}
            />
          </Suspense>

          <AddToCartPopup
            product={selectedProduct}
            isOpen={isAddToCartPopupOpen}
            onClose={() => {
              setIsAddToCartPopupOpen(false);
              setSelectedProduct(null);
            }}
          />
        </>
      )}
    </>
  );
}
