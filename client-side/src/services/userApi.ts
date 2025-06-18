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
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const user: IUser = {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone,
      role: data.user.role,
      active: data.user.is_active, // sửa lại cho đồng nhất backend
    };
    // if (isBrowser()) {
    //   localStorage.setItem("accessToken", data.token);
    // }
    return { user, accessToken: data.token };
  } catch (error) {
    console.error("Error logging in:", error);
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
      id: data.user._id,
      name: data.user.name || "",
      phone: data.user.phone || null,
      email: data.user.email || email,
      role: data.user.role || "user",
      active: data.user.is_active, // sửa lại cho đồng nhất backend
    };

    // if (typeof window !== "undefined") {
    //   localStorage.setItem("accessToken", data.token);
    // }

    return { user, accessToken: data.token };
  } catch (error: any) {
    console.error("Error registering:", error);
    throw error;
  }
}

// Lấy thông tin user (SỬA endpoint về /users/me)
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
      active: data.is_active, // đúng tên từ backend
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
      role: userData.role,
      active: userData.is_active, // đúng tên từ backend
    }));

    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return null;
  }
}
