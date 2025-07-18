import Container from "@/components/Core/Container";
import Breadcrumb from "@/components/Core/Layout/Breadcrumb";
import ProductDesktopLayout from "@/components/Detail/DetailLayout/ProductDesktopLayout";
import ProductMobileLayout from "@/components/Detail/DetailLayout/ProductMobileLayout";
import { fetchProductById, fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";

import { Metadata } from "next";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await fetchProductById(params.id);
    if (!product) throw new Error("Not found");

    return {
      title: product.name || "Sản phẩm",
      description: product.description || "",
      openGraph: {
        images: product.images || [],
      },
    };
  } catch {
    return {
      title: "Không tìm thấy sản phẩm",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;

  let product: IProduct | null = null;
  let suggestedProducts: IProduct[] = [];
  let error: string | null = null;

  try {
    product = await fetchProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm.");

    // Lọc các sản phẩm khác (giữ nguyên logic)
    suggestedProducts = await fetchProducts().then((res) =>
      res.data.filter((p) => p.id !== id)
    );
  } catch (err) {
    error = "Có lỗi xảy ra khi tải dữ liệu.";
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg text-red-500">
          {error || "Không tìm thấy sản phẩm."}
        </p>
      </div>
    );
  }

  // Tính toán size & stock (giữ nguyên)
  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).map(
    (size) => ({
      value: size,
      inStock: product.variants.some((v) => v.size === size && v.stock > 0),
    })
  );

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="min-h-screen pb-14">
      <Container>
        <Breadcrumb />

        {/* Mobile layout */}
        <ProductMobileLayout
          product={product}
          sizes={sizes}
          stock={stock}
          suggestedProducts={suggestedProducts}
        />

        {/* Desktop layout */}
        <div className="hidden tablet:flex tablet:flex-row tablet:gap-12 w-full">
          <ProductDesktopLayout
            product={product}
            sizes={sizes}
            stock={stock}
            suggestedProducts={suggestedProducts}
          />
        </div>
      </Container>
    </div>
  );
}
