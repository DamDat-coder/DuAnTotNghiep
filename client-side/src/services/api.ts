export const API_BASE_URL = "http://localhost:3000";

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
    }

    const data = await res.json();

    if (!data.accessToken) {
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
  // Không truyền headers Authorization nữa
  const res = await fetch(url, {
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("fetchWithAuth - Error details:", {
      status: res.status,
      message: errorData.message || "No error message",
      url,
    });
  }
  return res.json();
}
