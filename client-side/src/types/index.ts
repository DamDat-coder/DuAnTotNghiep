export interface IProduct {
  id: string;
  name: string;
  categoryId: string; // Thêm categoryId
  category: string; // Vẫn giữ category để hiển thị tên danh mục
  price: number;
  discountPercent: number;
  image: string[];
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
  id: string;
  email: string;
  avatar: string | null;
  role: "user" | "admin";
}
export interface AuthContextType {
  user: IUser | null;
  login: (
    identifier: string,
    password: string,
    keepLoggedIn: boolean
  ) => Promise<boolean>;
  register: (
    identifier: string,
    password: string,
    keepLoggedIn: boolean
  ) => Promise<boolean>;
  logout: () => void;
}

// src/types/index.ts
export interface IFilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilters?: (filters: FilterState) => void; // Callback để áp dụng bộ lọc
}

export interface FilterState {
  sort: string | null;
  gender: string | null;
  prices: string[];
  colors: string[];
  sizes: string[];
  brands: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface GenderOption {
  value: string;
  label: string;
}

export interface PriceOption {
  value: string;
  label: string;
}

export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export interface BrandOption {
  value: string;
  label: string;
}

// src/types/index.ts
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
}

export interface CheckoutErrors {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
}

export interface ICategory {
  id: string;
  name: string;
  description: string;
  img: string;
  parentId: string | null;
}
export interface ICartItem {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  liked: boolean;
}