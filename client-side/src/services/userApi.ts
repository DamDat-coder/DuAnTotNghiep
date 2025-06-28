import { Address, IUser } from "../types/auth";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";

interface UpdateUserData {
  name?: string;
  phone?: string;
  addresses?: IUser["addresses"];
}
interface AddAddressResponse {
  message: string;
  data: Address[];
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
      active: data.data.user.is_active,
    };

    if (isBrowser()) {
      localStorage.setItem("accessToken", data.data.accessToken);
      document.cookie = `refreshToken=${data.data.refreshToken}; path=/; max-age=3600`;
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
      active: data.data.user.is_active,
    };
    console.log("User - Register"+user.id);
    
    console.log("AccessToken - Register"+data.data.accessToken);
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
      active: data.user.is_active,
    };
  } catch (error: any) {
    console.error("fetchUser - Error:", error.message);
    return null;
  }
}

// Lấy danh sách tất cả user
export async function fetchAllUsers(): Promise<IUser[] | null> {
  try {
    const data = await fetchWithAuth<any[]>(`${API_BASE_URL}/users`, {
      cache: "no-store",
    });

    if (!data || !Array.isArray(data)) {
      throw new Error("Dữ liệu users không hợp lệ");
    }

    const users: IUser[] = data.map((userData) => ({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      role: userData.role,
      active: userData.is_active,
    }));

    return users;
  } catch (error: any) {
    if (error.message.includes("403")) {
      console.warn("User does not have admin privileges");
      return null;
    }
    return null;
  }
}

export async function updateUser(data: UpdateUserData): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetchWithAuth<{ user: IUser }>(
      `${API_BASE_URL}/users/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return res.user;
  } catch (error: any) {
    console.error("Cập nhật user thất bại:", error.message);
    return null;
  }
}

// Thêm địa chỉ mới
export async function addAddressWhenCheckout(userId: string, address: {
  street: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}): Promise<Address> {
  if (!userId || userId === "undefined") {
    throw new Error("userId không hợp lệ");
  }
  try {
    const response = await fetchWithAuth<AddAddressResponse>(`${API_BASE_URL}/users/${userId}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    });
    // Lấy địa chỉ mới nhất (phần tử cuối cùng của mảng data)
    const newAddress = response.data[response.data.length - 1];
    if (!newAddress || !newAddress._id) {
      throw new Error("Response không chứa address_id");
    }
    return {
      ...newAddress,
      _id: newAddress._id, // Đảm bảo _id được trả về
    };
  } catch (error: any) {
    console.error("Error adding address:", error);
    throw new Error(error.message || "Không thể thêm địa chỉ");
  }
}