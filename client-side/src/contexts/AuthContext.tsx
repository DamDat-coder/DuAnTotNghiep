"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AuthContextType, IUser } from "../types";
import { login, register, fetchUser } from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

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
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
      }

      // Redirect nếu là admin
      if (userData.role === "admin") {
        window.location.assign("/admin/dashboard");
      }

      return true;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw error;
    }
  };

  const registerHandler = async (
    identifier: string,
    password: string,
    keepLoggedIn: boolean,
    avatar?: File
  ): Promise<boolean> => {
    try {
      const result = await register(identifier, password, avatar);
      if (!result) {
        throw new Error("Không thể đăng ký tài khoản.");
      }

      const { user: userData, accessToken } = result;
      setUser(userData);

      if (keepLoggedIn) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
      }

      return true;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      throw error;
    }
  };

  const logoutHandler = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; path=/; max-age=0";
  };

  const checkAuth = async () => {
    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        logoutHandler();
      }
    } catch (error) {
      console.error("Lỗi kiểm tra auth:", error);
      logoutHandler();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};