import { IUser } from "../types/auth";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";

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
    console.log("Login response:", data);
    const user: IUser = {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone || null,
      role: data.user.role,
      active: data.user.is_active,
    };

    if (isBrowser()) {
      localStorage.setItem("accessToken", data.accessToken);
      console.log("Stored accessToken:", data.accessToken);
      console.log("Cookies after login:", document.cookie);
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
      body: JSON.stringify({
        name,
        email,
        password,
      }),
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
      email: data.user.email || email,
      role: data.user.role || "user",
      active: false, // Lỗi: Không nên hard-code
    };

    return { user, accessToken: data.accessToken };
  } catch (error: any) {
    console.error("Error registering:", error);
    throw error;
  }
}

// Lấy thông tin user
export async function fetchUser(): Promise<IUser | null> {
  try {
    const data = await fetchWithAuth<any>(`${API_BASE_URL}/users/me`, {
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
      role: data.role,
      active: data.is_active,
    };
  } catch (error: any) {
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
