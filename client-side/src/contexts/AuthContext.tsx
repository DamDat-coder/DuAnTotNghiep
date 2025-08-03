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

import toast from "react-hot-toast";
import {
  addProductToWishlistApi,
  removeFromWishlistApi,
  getWishlistFromApi,
} from "@/services/userApi";
import { IProduct } from "@/types/product";

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
  const [wishlist, setWishlist] = useState<IProduct[]>([]);

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

  const refreshUser = async () => {
    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        await fetchWishlist(userData.id);
      } else {
        setUser(null);
        setWishlist([]);
      }
    } catch (error) {
      setUser(null);
      setWishlist([]);
    }
  };
  const checkAuth = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setUser(null);
      setWishlist([]);
      return;
    }

    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        await fetchWishlist(userData.id); // Lấy wishlist khi có user
      } else {
        throw new Error("No user data returned");
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            const userData = await fetchUser();
            if (userData) {
              setUser(userData);
              await fetchWishlist(userData.id); // Lấy wishlist sau khi refresh token
            } else {
              throw new Error("No user data after token refresh");
            }
          } else {
            throw new Error("Refresh token failed");
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          setUser(null);
          setWishlist([]);
          localStorage.removeItem("accessToken");
          document.cookie = "refreshToken=; path=/; max-age=0";
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        }
      } else {
        console.error("Unexpected error in checkAuth:", error);
        setUser(null);
        setWishlist([]);
        localStorage.removeItem("accessToken");
        toast.error("Có lỗi xảy ra khi xác thực người dùng.");
      }
    }
  };
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
      toast.success("Đăng nhập thành công");
      const { user: userData, accessToken } = result;
      setUser(userData);

      if (keepLoggedIn) {
        localStorage.setItem("accessToken", accessToken);
      }

      await fetchWishlist(userData.id);

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
      const result = await register(name, email, password);
      if (!result) {
        throw new Error("Không thể đăng ký tài khoản.");
      }

      const { user: userData, accessToken } = result;

      if (keepLoggedIn) {
        setUser(userData);
        localStorage.setItem("accessToken", accessToken);
        // Fetch wishlist after successful registration
        await fetchWishlist(userData.id);
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
      throw (error);
    }
  };

  const logoutHandler = () => {
    setUser(null);
    setWishlist([]); // Reset wishlist khi logout
    localStorage.removeItem("accessToken");
    document.cookie = "refreshToken=; path=/; max-age=0";
    window.location.href = "/";
  };

  const loginWithGoogle = async (id_token: string) => {
    try {
      const data = await googleLogin(id_token);
      const { user: userData, accessToken } = data;
      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      await fetchWishlist(userData.id); // Lấy wishlist sau khi đăng nhập bằng Google
      return true;
    } catch (err) {
      console.error("Google login error", err);
      throw err;
    }
  };

  // Hàm lấy wishlist
  const fetchWishlist = async (userId: string) => {
    try {
      const products = await getWishlistFromApi(userId);
      setWishlist(products);
    } catch (error) {
      console.error("Lỗi khi lấy wishlist:", error);
    }
  };

  // Thêm sản phẩm vào wishlist
  const addWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await addProductToWishlistApi(user.id, productId); // Gọi API thêm sản phẩm vào wishlist
      await fetchWishlist(user.id); // Refresh wishlist để có dữ liệu đầy đủ
      toast.success("Sản phẩm đã được thêm vào danh sách yêu thích.");
    } catch (error) {
      toast.error("Không thể thêm sản phẩm vào danh sách yêu thích.");
    }
  };

  // Xoá sản phẩm khỏi wishlist
  const removeWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await removeFromWishlistApi(user.id, productId); // Gọi API xoá sản phẩm khỏi wishlist
      const updatedWishlist = wishlist.filter((item) => item.id !== productId); // Cập nhật wishlist
      setWishlist(updatedWishlist);
      toast.success("Sản phẩm đã được xoá khỏi danh sách yêu thích.");
    } catch (error) {
      toast.error("Không thể xoá sản phẩm khỏi danh sách yêu thích.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
        loginWithGoogle: loginWithGoogle,
        openLoginWithData,
        setOpenLoginWithData,
        registerFormData,
        addWishlist,
        removeWishlist,
        setRegisterFormData,
        refreshUser,
        wishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
