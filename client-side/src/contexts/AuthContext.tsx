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
        console.log("Stored accessToken:", accessToken); // Debug
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
        console.log("Stored accessToken in session:", accessToken); // Debug
      }

      if (userData.role === "admin") {
        window.location.assign("/admin/dashboard");
      }

      return true;
    } catch (error) {
      const message = error instanceof Error && error.message.includes("404")
        ? "Không tìm thấy dịch vụ đăng nhập."
        : "Email hoặc mật khẩu không đúng.";
      console.error("Lỗi đăng nhập:", error);
      throw new Error(message);
    }
  };

  const registerHandler = async (
    name: string,
    identifier: string,
    password: string,
    keepLoggedIn: boolean
  ): Promise<boolean> => {
    try {
      const result = await register(name, identifier, password);
      if (!result) {
        throw new Error("Không thể đăng ký tài khoản.");
      }

      const { user: userData, accessToken } = result;
      setUser(userData);

      if (keepLoggedIn) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
        console.log("Stored accessToken:", accessToken); // Debug
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
        console.log("Stored accessToken in session:", accessToken); // Debug
      }

      return true;
    } catch (error) {
      const message = error instanceof Error
        ? error.message.includes("400")
          ? "Email, mật khẩu hoặc tên không hợp lệ. Vui lòng kiểm tra lại."
          : error.message
        : "Có lỗi xảy ra khi đăng ký.";
      console.error("Lỗi đăng ký:", error);
      throw new Error(message);
    }
  };

  const logoutHandler = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; path=/; max-age=0";
    console.log("Logged out, cleared storage"); // Debug
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