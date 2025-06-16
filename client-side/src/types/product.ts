// types/product.ts
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string; // Thêm trường mô tả
  category: {
    _id: string | null;
    name: string;
  };
  categoryId: string | null;
  variants: {
    price: number;
    color: string;
    size: string;
    stock: number;
    discountPercent: number;
  }[];
  images: string[];
  stock: number;
  is_active: boolean; // Thêm trường trạng thái
  salesCount: number; // Thêm trường số lượng bán
}
export interface IFeaturedProducts {
  id: string;
  banner: string;
  gender: string;
  description: string;
}

export interface IMemberBenefit {
  id: string;
  image: string;
  benefit: string;
}
