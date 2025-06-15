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

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      console.log("initializeAuth - accessToken:", accessToken);
      if (accessToken) {
        console.log("Initializing auth check...");
        await checkAuth();
      } else {
        console.log("No stored user or accessToken, skipping checkAuth");
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
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
      }

      if (userData.role === "admin") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
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
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("accessToken", accessToken);
      }

      return true;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      throw new Error("Có lỗi xảy ra khi đăng ký.");
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
    console.log("Running checkAuth...");
    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("checkAuth - fetchUser returned null, logging out");
        logoutHandler();
      }
    } catch (error) {
      console.error("checkAuth - Error:", error);
      console.warn("checkAuth - Logging out due to error");
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
