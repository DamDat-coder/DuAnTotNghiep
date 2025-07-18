import { IProduct } from "@/types/product";
import ProductSection from "../../Home/ProductSection/ProductSection";
import DesktopImageGalleryWrapper from "../ImageGallery/DesktopImageGalleryWrapper";
import ProductActions from "../ProductAction/ProductActions";
import ProductDetailsSection from "../DetailSection/ProductDetailsSection";
import ProductMainInfo from "../ProductAction/ProductMainInfo";

export default function ProductDesktopLayout({
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
    <>
      {/* Left Column */}
      <div className="hidden overflow-hidden tablet:flex tablet:flex-col tablet:w-3/5 desktop:flex desktop:flex-col desktop:w-3/4 laptop:flex laptop:flex-col laptop:w-2/3 overflow-x-hidden">
        <DesktopImageGalleryWrapper
          images={product.images.filter(
            (img): img is string => typeof img === "string"
          )}
          productName={product.name}
        />
        <ProductDetailsSection product={product} />
        <div className="mb-4 mt-9">
          <ProductSection products={suggestedProducts} />
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden desktop:block desktop:sticky desktop:top-0 desktop:self-start desktop:w-1/4 gap-16 laptop:block laptop:sticky laptop:top-0 laptop:self-start laptop:w-1/3 tablet:block tablet:sticky tablet:top-0 tablet:self-start tablet:w-2/5 pb-20">
        <ProductMainInfo product={product} />
        <ProductActions product={product} sizes={sizes} stock={stock} />
      </div>
    </>
  );
}
