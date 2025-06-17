import { isBrowser } from "../utils";

export const API_BASE_URL = "http://localhost:3000";

const getAccessToken = (): string | null => {
  return isBrowser() ? localStorage.getItem("accessToken") : null;
};

function getAuthHeaders(isFormData: boolean = false) {
  const token = getAccessToken();
  return isFormData
    ? { Authorization: `Bearer ${token}` }
    : {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.accessToken) {
      throw new Error("No access token in refresh response");
    }

    return true;
  } catch (error: any) {
    return false;
  }
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers = requiresAuth
    ? { ...getAuthHeaders(isFormData), ...options.headers }
    : options.headers;
  const res = await fetch(url, {
    ...options,
    headers: headers as Record<string, string>,
  });

  if (requiresAuth && res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      const newHeaders = requiresAuth
        ? { ...getAuthHeaders(isFormData), ...options.headers }
        : options.headers;

      const retryRes = await fetch(url, {
        ...options,
        headers: newHeaders as Record<string, string>,
      });

      if (!retryRes.ok) {
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
