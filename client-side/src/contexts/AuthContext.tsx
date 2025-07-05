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
    const accessToken = localStorage.getItem("accessToken");

    try {
      // Nếu có token, thử fetch user
      if (accessToken) {
        const userData = await fetchUser();
        if (userData) {
          setUser(userData);
          return;
        }
      }

      // Không có token hoặc fetch thất bại => thử refresh token
      console.warn("checkAuth - Access token không hợp lệ, đang làm mới...");
      const newToken = await refreshToken();
      console.log(newToken);
      
      if (newToken) {
        localStorage.setItem("accessToken", newToken);

        const retriedUser = await fetchUser();
        if (retriedUser) {
          setUser(retriedUser);
        } else {
          console.warn("checkAuth - fetchUser sau khi refresh vẫn fail");
          setUser(null);
          localStorage.removeItem("accessToken");
        }
      } else {
        // Refresh thất bại
        console.warn("checkAuth - Làm mới token thất bại");
        setUser(null);
        localStorage.removeItem("accessToken");
      }
    } catch (error: any) {
      console.error("checkAuth - Lỗi bất ngờ:", error.message);
      setUser(null);
      localStorage.removeItem("accessToken");
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
