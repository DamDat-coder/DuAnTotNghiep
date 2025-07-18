import { IProduct } from "@/types/product";
import ProductSection from "../../Home/ProductSection/ProductSection";
import ProductActions from "../ProductAction/ProductActions";
import ProductDetailsSection from "../DetailSection/ProductDetailsSection";
import ProductImageSwiper from "../ImageGallery/ProductImageSwiper";
import ProductMainInfo from "./ProductMainInfo";

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
        <ProductSection products={suggestedProducts}/>
      </div>
    </div>
  );
}
