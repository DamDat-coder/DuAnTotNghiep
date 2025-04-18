import {
  IProduct,
  IMemberBenefit,
  IUser,
  IFeaturedProducts,
  ICategory,
} from "../types";

// Định nghĩa base URL của backend
export const API_BASE_URL = "http://localhost:3000";
const TEMP_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";
const TEMP2_URL = "https://67e0f65058cc6bf785238ee0.mockapi.io/";

// Hàm kiểm tra môi trường trình duyệt
const isBrowser = () => typeof window !== "undefined";

// Hàm lấy access token từ localStorage
const getAccessToken = (): string | null => {
  return isBrowser() ? localStorage.getItem("accessToken") : null;
};

// Hàm thiết lập header với token
const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

  if (requiresAuth && res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newHeaders = requiresAuth
        ? { ...getAuthHeaders(), ...options.headers }
        : options.headers;
      const retryRes = await fetch(url, {
        ...options,
        headers: newHeaders as Record<string, string>,
      });
      if (!retryRes.ok) throw new Error(`HTTP error! status: ${retryRes.status}`);
      return retryRes.json();
    }
    throw new Error("Unable to refresh token");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

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
    console.log("Sending register request:", url, { name, email: identifier, phone });
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
    console.log("fetchUser response:", data);

    if (!data || !data._id) {
      throw new Error("Dữ liệu user không hợp lệ");
    }

    const user: IUser = {
      id: data._id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role,
    };
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Lấy danh sách tất cả user
export async function fetchAllUsers(): Promise<IUser[] | null> {
  try {
    const data = await fetchWithAuth<any[]>(`${API_BASE_URL}/users`, {
      cache: "no-store",
    });
    console.log("fetchAllUsers response:", data);

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

// Lấy danh sách sản phẩm
export async function fetchProducts(query: {
  gender?: string;
  discount?: boolean;
  name?: string;
  idcate?: string;
  limit?: number;
  page?: number;
  sort?: "asc" | "desc";
} = {}): Promise<IProduct[]> {
  try {
    const queryParams = new URLSearchParams();
    if (query.gender) queryParams.append("gender", query.gender);
    if (query.discount !== undefined) queryParams.append("discount", String(query.discount));
    if (query.name) queryParams.append("name", query.name);
    if (query.idcate) queryParams.append("idcate", query.idcate);
    if (query.limit) queryParams.append("limit", String(query.limit));
    if (query.page) queryParams.append("page", String(query.page));
    if (query.sort) queryParams.append("sort", query.sort);

    const url = `${API_BASE_URL}/products/?${queryParams.toString()}`;
    const temp = await fetchWithAuth<any>(url, { cache: "no-store" }, false);
    let data: IProduct[] = temp.data.map((e: any) => ({
      id: e._id,
      name: e.name,
      category: e.categoryId?.name || "Không rõ",
      price: e.price,
      discountPercent: e.discountPercent,
      image: e.image,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Thêm sản phẩm
export async function addProduct(product: {
  name: string;
  categoryId: string;
  price: number;
  discountPercent?: number;
  images: File[];
}): Promise<IProduct | null> {
  try {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("categoryId", product.categoryId);
    formData.append("price", product.price.toString());
    if (product.discountPercent) {
      formData.append("discountPercent", product.discountPercent.toString());
    }
    product.images.forEach((image, index) => {
      formData.append("image", image);
    });

    const res = await fetchWithAuth<IProduct>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });
    return res;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

// Lấy sản phẩm theo ID
export async function fetchProductById(id: string): Promise<IProduct | null> {
  try {
    const temp = await fetchWithAuth<any>(`${API_BASE_URL}/products/${id}`, { cache: "no-store" }, false);
    const product: IProduct = {
      id: temp._id,
      categoryId: temp.categoryId?.$oid || temp.categoryId,
      name: temp.name,
      category: temp.categoryId?.name || "Không rõ",
      price: temp.price,
      discountPercent: temp.discountPercent,
      image: temp.image,
    };
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

// Lấy danh mục
export async function fetchCategories(): Promise<ICategory[]> {
  try {
    const data = await fetchWithAuth<{ data: any[] }>(`${API_BASE_URL}/categories`, {
      cache: "no-store",
    }, false);
    return data.data.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description || "",
      img: item.img || "",
      parentId: item.parentId || null,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Lấy lợi ích thành viên
export async function fetchMemberBenefits(): Promise<IMemberBenefit[]> {
  try {
    return await fetchWithAuth<IMemberBenefit[]>(`${TEMP_URL}/memberBenefits`, { cache: "no-store" }, false);
  } catch (error) {
    console.error("Error fetching member benefits:", error);
    return [];
  }
}

// Lấy featured section
export async function fetchFeaturedSection(): Promise<IFeaturedProducts[]> {
  try {
    const temp = await fetchWithAuth<any>(`${TEMP2_URL}/memberBenefit`, { cache: "no-store" }, false);
    let data: IFeaturedProducts[] = temp.map((e: any) => ({
      id: e.id,
      banner: e.banner || "",
      gender: e.gender || "unknown",
    }));
    return data;
  } catch (error) {
    console.error("Error fetching featured section:", error);
    return [];
  }
}

export async function createOrder(order: {
  products: { productId: string; quantity: number }[];
  shippingAddress: string;
}): Promise<{ message: string; data: any } | null> {
  try {
    const res = await fetchWithAuth<any>(`${API_BASE_URL}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Không thể tạo đơn hàng");
  }
}
// Lấy tất cả đơn hàng (cho admin)
export async function fetchAllOrders(query: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (query.page) queryParams.append("page", query.page.toString());
    if (query.limit) queryParams.append("limit", query.limit.toString());
    if (query.status) queryParams.append("status", query.status);

    const url = `${API_BASE_URL}/order`;
    const response = await fetchWithAuth<{ data: any[]; total: number; page: number; limit: number }>(url, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

// Lấy chi tiết đơn hàng theo ID
export async function fetchOrderById(id: string): Promise<any> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/order/${id}`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
}

// Cập nhật trạng thái đơn hàng
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    console.log(`Updating order ${orderId} with status ${status}`);
    await fetchWithAuth(`${API_BASE_URL}/order/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export type { IUser };