export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  active: boolean;
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
    name: string,
    identifier: string,
    password: string,
    keepLoggedIn: boolean
  ) => Promise<boolean>;
  logout: () => void;
}
