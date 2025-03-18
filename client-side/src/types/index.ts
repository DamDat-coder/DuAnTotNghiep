export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  image: string; 
  banner: string; 
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