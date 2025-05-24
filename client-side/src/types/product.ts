export interface IProduct {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  discountPercent: number;
  images: string[] | File[];
  sizes: string[];
}

export interface IFeaturedProducts {
  id: string;
  banner: string;
  gender: string;
}

export interface IMemberBenefit {
  id: string;
  image: string;
  benefit: string;
}