// src/types/index.ts
export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    discountPercent: number;
    image: string; // Thêm trường image
  }