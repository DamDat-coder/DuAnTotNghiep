export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  role: "user" | "admin";
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
  registerFormData: { name: string; email: string; password: string } | null;
}
