export interface IUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "user" | "admin";
  active: boolean;
  addresses?: {
    street: string;
    ward: string;
    district: string;
    province: string;
    is_default: boolean;
  }[];
}

export interface AuthContextType {
  user: IUser | null;
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
}
