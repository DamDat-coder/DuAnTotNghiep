import { useState } from "react";
import { useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types/product";
import ProductActions from "../ProductAction/ProductActions";
import ProductDetailsSection from "../DetailSection/ProductDetailsSection";
import ProductImageSwiper from "../ImageGallery/ProductImageSwiper";
import ProductMainInfo from "../ProductAction/ProductMainInfo";
import AddToCartPopup from "../../Cart/AddToCart/AddToCartPopup";
import BuyNowPopup from "../../Core/Layout/BuyNowButton/BuyNowPopup";
import { Suspense } from "react";
import toast from "react-hot-toast";
import ProductSwiper from "@/components/Home/ProductSection/ProductSwiper";

export default function ProductMobileLayout({
  product,
  sizes,
  stock,
  suggestedProducts,
}: {
  product: IProduct;
  sizes: { value: string; inStock: boolean }[];
  stock: number;
  suggestedProducts: IProduct[];
}) {
  const dispatch = useCartDispatch();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isBuyNowPopupOpen, setIsBuyNowPopupOpen] = useState(false);
  const [isAddToCartPopupOpen, setIsAddToCartPopupOpen] = useState(false);

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
    <div className="flex flex-col gap-9 tablet:hidden">
      <div>
        <ProductMainInfo product={product} />
        <div className="relative mt-4">
          <ProductImageSwiper
            images={product.images.filter(
              (img): img is string => typeof img === "string"
            )}
            productName={product.name}
          />
        </div>
      </div>
      <ProductActions product={product} sizes={sizes} stock={stock} />
      <ProductDetailsSection product={product} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm gợi ý</h2>
        {suggestedProducts.length === 0 ? (
          <p className="text-center text-gray-500">Không có sản phẩm gợi ý.</p>
        ) : (
          <ProductSwiper
            products={suggestedProducts}
            slidesPerView={1.5}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
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
    </div>
  );
}
