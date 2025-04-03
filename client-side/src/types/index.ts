export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  image: string; 

}

export interface FeaturedProducts {
  id: string;
  banner: string;
  gender: string;
}
export interface MemberBenefit {
  id: string;
  image: string;
  benefit: string;
}

export interface FilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface User {
  id: string;
  email: string;
  "số điện thoại": string;
  role: "admin" | "user";
  password: string; // Thêm field password
}