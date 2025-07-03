import { IProduct } from "./product";

export interface Address {
  street: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "user" | "admin";
  is_active: boolean;
  addresses?: Address[];
  wishlist?: IProduct[];
}

export interface AuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  login: (
    email: string,
    password: string,
    keepLoggedIn: boolean
  ) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    keepLoggedIn: boolean
  ) => Promise<boolean>;
  logout: () => void;
  openLoginWithData: boolean;
  setOpenLoginWithData: (value: boolean) => void;
  registerFormData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  } | null;
  addWishlist: (productId: string) => void;
  removeWishlist: (productId: string) => void;
  wishlist: IProduct[];
}
