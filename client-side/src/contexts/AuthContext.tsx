"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthContextType, IUser } from "../types/auth";
import { login, register, fetchUser } from "../services/userApi";
import { refreshToken } from "@/services/api";
import { googleLogin } from "@/services/userApi";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [registerFormData, setRegisterFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  } | null>(null);
  const [openLoginWithData, setOpenLoginWithData] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        console.log("Initializing auth check...");
        await checkAuth();
      } else {
        console.log("No accessToken, skipping checkAuth");
      }
    };
    initializeAuth();
  }, []);

  const loginHandler = async (
    identifier: string,
    password: string,
    keepLoggedIn: boolean
  ): Promise<boolean> => {
    try {
      const result = await login(identifier, password);
      if (!result) {
        throw new Error("Email hoặc mật khẩu không đúng.");
      }

      const { user: userData, accessToken } = result;
      setUser(userData);

      if (keepLoggedIn) {
        localStorage.setItem("accessToken", accessToken);
      }

      if (userData.role === "admin") {
        window.location.assign("/admin/dashboard");
      }

      return true;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw new Error("Email hoặc mật khẩu không đúng.");
    }
  };

  const registerHandler = async (
    name: string,
    email: string,
    password: string,
    keepLoggedIn: boolean
  ): Promise<boolean> => {
    try {
      console.log(name, email, password);
      const result = await register(name, email, password);
      if (!result) {
        throw new Error("Không thể đăng ký tài khoản.");
      }

      const { user: userData, accessToken } = result;

      if (keepLoggedIn) {
        setUser(userData);
        localStorage.setItem("accessToken", accessToken);
      } else {
        setRegisterFormData({
          name,
          email,
          password,
          confirmPassword: password,
        });
        setOpenLoginWithData(true);
      }

      return true;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setRegisterFormData({ name, email, password, confirmPassword: password });
      setOpenLoginWithData(true);
      throw new Error("Có lỗi xảy ra khi đăng ký.");
    }
  };

  const logoutHandler = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; path=/; max-age=0";
  };
  const loginWithGoogle = async (id_token: string) => {
    try {
      const data = await googleLogin(id_token);

      const { user: userData, accessToken } = data;
      setUser(userData);
      localStorage.setItem("accessToken", accessToken);

      return true;
    } catch (err) {
      console.error("Google login error", err);
      throw err;
    }
  };

  const checkAuth = async () => {
    console.log("Running checkAuth...");
    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
      } else {
        console.warn("checkAuth - fetchUser returned null");
        setUser(null);
      }
    } catch (error: any) {
      console.error("checkAuth - Error:", error);
      if (error.message.includes("401")) {
        console.warn("checkAuth - Unauthorized, attempting to refresh token");
        try {
          const newToken = await refreshToken(); // Hàm làm mới token
          localStorage.setItem("accessToken", String(newToken));
          const userData = await fetchUser(); // Thử lại
          setUser(userData || null);
        } catch (refreshError) {
          console.error("checkAuth - Refresh token failed:", refreshError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
        loginWithGoogle: loginWithGoogle,
        openLoginWithData,
        setOpenLoginWithData,
        registerFormData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
