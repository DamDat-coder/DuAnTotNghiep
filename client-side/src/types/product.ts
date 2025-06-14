export interface IProduct {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  colors: string[];
  price: number;
  discountPercent: number;
  images: string[] | File[];
  sizes: { value: string; inStock: boolean }[];
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