import { IUser } from "../types/auth";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";

// Hàm đăng nhập
export async function login(
  identifier: string,
  password: string
): Promise<{ user: IUser; accessToken: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const user: IUser = {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone,
      avatar: data.user.avatar,
      role: data.user.role,
    };
    if (isBrowser()) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return { user, accessToken: data.accessToken };
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
}

// Hàm đăng ký
export async function register(
  name: string,
  identifier: string,
  password: string,
  phone?: string,
  avatar?: File
): Promise<{ user: IUser; accessToken: string } | null> {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", identifier);
    formData.append("password", password);
    if (phone && phone.trim() !== "") formData.append("phone", phone);
    if (avatar) formData.append("avatar", avatar);

    const url = `${API_BASE_URL}/users/register`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
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
      id: data.user._id,
      name: data.user.name || "",
      phone: data.user.phone || null,
      email: data.user.email || identifier,
      avatar: data.user.avatar || null,
      role: data.user.role || "user",
    };
    if (isBrowser()) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return { user, accessToken: data.accessToken };
  } catch (error: any) {
    console.error("Error registering:", error);
    throw error;
  }
}

// Lấy thông tin user
export async function fetchUser(): Promise<IUser | null> {
  try {
    const data = await fetchWithAuth<any>(`${API_BASE_URL}/users/userinfo`, {
      cache: "no-store",
    });
    if (!data || !data._id) {
      console.warn("fetchUser - Invalid user data, returning null");
      return null;
    }
    return {
      id: data._id,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      avatar: data.avatar || null,
      role: data.role,
    };
  } catch (error) {
    console.error("fetchUser - Error:", error);
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
      phone: userData.phone,
      password: userData.password,
      avatar: userData.avatar,
      role: userData.role,
    }));

    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return null;
  }
}