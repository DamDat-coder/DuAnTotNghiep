import { isBrowser } from "../utils";

// Định nghĩa base URL của backend
export const API_BASE_URL = "http://localhost:3000";

// Hàm lấy access token từ localStorage
const getAccessToken = (): string | null => {
  return isBrowser() ? localStorage.getItem("accessToken") : null;
};

// Hàm thiết lập header với token
function getAuthHeaders() {
  const token = getAccessToken();
  console.log("getAuthHeaders - Token:", token);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Hàm làm mới token
export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (isBrowser()) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

// Hàm fetch với xác thực
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<T> {
  const headers = requiresAuth
    ? { ...getAuthHeaders(), ...options.headers }
    : options.headers;
  const res = await fetch(url, {
    ...options,
    headers: headers as Record<string, string>,
  });
  console.log("fetchWithAuth - Response status:", res.status);

  if (requiresAuth && res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      console.log("fetchWithAuth - Token refreshed, retrying request...");
      const newHeaders = requiresAuth
        ? { ...getAuthHeaders(), ...options.headers }
        : options.headers;

      const retryRes = await fetch(url, {
        ...options,
        headers: newHeaders as Record<string, string>,
      });

      if (!retryRes.ok) {
        console.error("fetchWithAuth - Retry failed, status:", retryRes.status);
        throw new Error(`HTTP error! status: ${retryRes.status}`);
      }
      return retryRes.json();
    } else {
      throw new Error("Unable to refresh token");
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("fetchWithAuth - Error details:", {
      status: res.status,
      message: errorData.message || "No error message",
      url,
    });
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}