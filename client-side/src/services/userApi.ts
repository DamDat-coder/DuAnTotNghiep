import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";
import { IUser } from "@/types/auth";
import { fetchProductById } from "./productApi";
import { IProduct } from "@/types/product";

interface UpdateUserData {
  name?: string;
  phone?: string;
  role?: string;
  addresses?: IUser["addresses"];
}

interface UserData {
  _id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  is_active: boolean;
}

// Hàm đăng nhập
export async function login(
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const user: IUser = {
      id: data.data.user._id,
      email: data.data.user.email,
      name: data.data.user.name,
      phone: data.data.user.phone || null,
      role: data.data.user.role,
      is_active: data.data.user.is_active,
    };

    if (isBrowser()) {
      localStorage.setItem("accessToken", data.data.accessToken);
    }

    return { user, accessToken: data.accessToken };
  } catch (error: any) {
    console.error("Error logging in:", error.message);
    return null;
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string } | null> {
  try {
    const url = `${API_BASE_URL}/users/register`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = {};
      }
      console.error("Register failed:", res.status, errorData);
      throw new Error(
        errorData.message || "Email, mật khẩu hoặc tên không hợp lệ."
      );
    }

    const data = await res.json();
    const user: IUser = {
      id: data.data.user.id,
      name: data.data.user.name || "",
      phone: data.data.user.phone || null,
      email: data.data.user.email || email,
      role: data.data.user.role || "user",
      is_active: data.data.user.is_active,
    };
    console.log("User - Register" + user.id);

    console.log("AccessToken - Register" + data.data.accessToken);
    return { user, accessToken: data.data.accessToken };
  } catch (error: any) {
    console.error("Error registering:", error);
    throw error;
  }
}

export async function fetchUser(): Promise<IUser | null> {
  try {
    const data = await fetchWithAuth<any>(`${API_BASE_URL}/users/me`, {
      cache: "no-store",
    });

    if (!data || !data.user._id) {
      console.warn("fetchUser - Invalid user data:", data);
      return null;
    }
    return {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone || null,
      role: data.user.role,
      is_active: data.user.is_active,
      addresses: data.user.addresses || [],
    };
  } catch (error: any) {
    console.error("fetchUser - Error:", error.message);
    return null;
  }
}

export async function fetchAllUsers(): Promise<IUser[] | null> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/users`, {
      cache: "no-store",
    });

    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid data:", response);
      return null;
    }

    const users: IUser[] = response.data.map((userData: UserData) => ({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      role: userData.role,
      is_active: userData.is_active,
    }));
    return users;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<IUser | null> {
  let returnValue = null;
  try {
    const token = localStorage.getItem("accessToken");

    // Nếu không có token, trả về null hoặc có thể thông báo người dùng đăng nhập lại
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return returnValue;
    }

    // Gửi yêu cầu PUT để cập nhật thông tin người dùng
    const result = await fetchWithAuth<{ user: IUser }>( // fetchWithAuth giờ trả về dữ liệu trực tiếp
      `${API_BASE_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    console.log("API response:", result);
    // Kiểm tra xem API có trả về dữ liệu hợp lệ không
    if (result && result.user) {
      returnValue = result.user;
    }
    return returnValue;
  } catch (error: any) {
    console.error("Cập nhật user thất bại:", error.message);
    return returnValue;
  }
}

export async function toggleUserStatus(userId: string, is_active: boolean) {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const result = await fetchWithAuth<{ success: boolean; data: IUser }>(
      `${API_BASE_URL}/users/${userId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      }
    );

    if (result && result.success) {
      return result.data; // Trả về người dùng đã cập nhật
    } else {
      throw new Error("Không thể cập nhật trạng thái người dùng.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    return null;
  }
}

export async function addAddress(
  userId: string,
  addressData: any
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Thêm địa chỉ thất bại:", error.message);
    return null;
  }
}

// Function to update an address for a user
export async function updateAddress(
  userId: string,
  addressId: string,
  addressData: any
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Cập nhật địa chỉ thất bại:", error.message);
    return null;
  }
}

// Function to delete an address for a user
export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Xoá địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Xoá địa chỉ thất bại:", error.message);
    return null;
  }
}

// Function to set a specific address as default
export async function setDefaultAddress(
  userId: string,
  addressId: string
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}/default`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật địa chỉ mặc định thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Cập nhật địa chỉ mặc định thất bại:", error.message);
    return null;
  }
}

export const addProductToWishlistApi = async (
  userId: string,
  productId: string
) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Thêm sản phẩm vào danh sách yêu thích thất bại."
      );
    }

    const data = await response.json(); // Trả về dữ liệu đã thêm vào wishlist
    return data;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào wishlist:", error);
    throw error;
  }
};

export const removeFromWishlistApi = async (
  userId: string,
  productId: string
) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/wishlist/${productId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Xoá sản phẩm khỏi danh sách yêu thích thất bại."
      );
    }

    const data = await response.json(); // Trả về dữ liệu đã cập nhật wishlist
    return data;
  } catch (error) {
    console.error("Lỗi khi xoá sản phẩm khỏi wishlist:", error);
    throw error;
  }
};

export async function getWishlistFromApi(userId: string): Promise<IProduct[]> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Lấy danh sách wishlist thất bại.");
    }

    const data = await response.json();
    if (!data || !data.data) {
      console.error("Không có dữ liệu wishlist.");
      return [];
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}
