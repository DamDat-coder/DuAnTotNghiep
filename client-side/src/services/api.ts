import { isBrowser } from "../utils";

// Chuẩn hoá BASE_URL: bỏ mọi dấu / cuối
const rawBase = process.env.NEXT_PUBLIC_API_URL || "";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

// Ghép URL: nếu truyền vào là path ("/products") -> ghép BASE_URL
function joinUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE_URL}${path}`;
}

const getAccessToken = (): string | null => {
  return isBrowser() ? localStorage.getItem("accessToken") : null;
};

function getAuthHeaders(isFormData: boolean = false) {
  const token = getAccessToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

// ==== userApi.ts ====
export async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(joinUrl("/users/refresh-token"), {
      method: "POST",
      credentials: "include", // Gửi cookie refresh
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (!data.accessToken) throw new Error("No access token in refresh response");
    return data.accessToken;
  } catch (error: any) {
    console.error("refreshToken - Error:", error.message);
    return null;
  }
}

export async function fetchWithAuth<T>(
  pathOrUrl: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers = requiresAuth
    ? { ...getAuthHeaders(isFormData), ...(options.headers as Record<string, string> | undefined) }
    : (options.headers as Record<string, string> | undefined);

  const url = joinUrl(pathOrUrl);

  const res = await fetch(url, {
    ...options,
    headers,
    // Mặc định include cookie (có thể override qua options.credentials)
    credentials: options.credentials ?? "include",
  });

  if (requiresAuth && res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      const retryHeaders = requiresAuth
        ? { ...getAuthHeaders(isFormData), ...(options.headers as Record<string, string> | undefined) }
        : (options.headers as Record<string, string> | undefined);

      const retryRes = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: options.credentials ?? "include",
      });

      if (!retryRes.ok) {
        throw new Error(`HTTP error! status: ${retryRes.status}`);
      }
      // Nếu 204 No Content
      if (retryRes.status === 204) return null as unknown as T;
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
      accountBlocked: errorData.accountBlocked,
    });
    throw {
      message: errorData.message || `HTTP error! status: ${res.status}`,
      status: res.status,
      accountBlocked: errorData.accountBlocked || false,
      errorCode: errorData.errorCode,
    };
  }

  if (res.status === 204) return null as unknown as T;
  return res.json();
}
