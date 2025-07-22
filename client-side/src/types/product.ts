import { ICategoryNews } from "./category";
import { SortOption } from "./filter";

// types/product.ts
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
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
    discountedPrice: number;
  }[];
  images: string[];
  is_active: boolean;
  salesCount: number;
}

export interface ProductGridProps {
  products: IProduct[];
  totalProducts: number;
  onApplyFilters: (filters: {
    sort_by?: "newest" | "oldest" | "price_asc" | "price_desc" | "best_selling";
    id_cate?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  }) => void;
  currentFilters: {
    id_cate?: string;
    sort_by?: SortOption;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  };
}

export interface IFeaturedProducts {
  id: string;
  banner: string;
  gender: string;
  description: string;
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

export interface ProductReview {
  _id: string;
  name: string;
}

export interface Suggestion {
  name: string;
  id: string;
}