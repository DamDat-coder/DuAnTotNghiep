import { IProduct } from "./product";

export interface Address {
  _id: string;
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
  active: boolean;
  defaultAddress?: string;
}

export type AuthContextType = {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  login: (
    identifier: string,
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
  loginWithGoogle: (id_token: string) => Promise<boolean>;
  openLoginWithData: boolean;
  setOpenLoginWithData: React.Dispatch<React.SetStateAction<boolean>>;
  registerFormData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  } | null;

  addWishlist: (productId: string) => void;
  removeWishlist: (productId: string) => void;
  wishlist: IProduct[];
};

export interface UserData {
  _id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: "user" | "admin";
  is_active: boolean;
  addresses?: Address[];
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  role?: string;
  addresses?: IUser["addresses"];
}
