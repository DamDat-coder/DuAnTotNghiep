export interface IProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  image: string; 

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

export interface IFilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// src/types/index.ts
export interface IUser {
  id?: number | string;
  name:string,
  email: string;
  phone: string;
  role: string;
  password?: string;
}

export interface AuthContextType {
  user: IUser | null;
  login: (identifier: string, password: string, keepLoggedIn: boolean) => Promise<boolean>;
  register: (identifier: string, password: string, keepLoggedIn: boolean) => Promise<boolean>;
  logout: () => void;
}

// Các interface khác (Product, MemberBenefit, v.v.) giữ nguyên