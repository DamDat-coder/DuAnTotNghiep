import {
  IProduct,
  IMemberBenefit,
  IUser,
  IFeaturedProducts,
  ICategory,
} from "../types";

// Định nghĩa base URL của backend
const API_BASE_URL = "http://localhost:3000"; 
const TEMP_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";
const TEMP2_URL = "https://67e0f65058cc6bf785238ee0.mockapi.io/";

// Hàm kiểm tra môi trường trình duyệt
const isBrowser = () => typeof window !== "undefined";

// Hàm lấy access token từ localStorage (chỉ trong trình duyệt)
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

// Hàm xử lý request với retry khi token hết hạn
async function fetchWithAuth<T>(
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

  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Đăng nhập
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

// Đăng ký
export async function register(
  email: string,
  password: string,
  avatar?: File
): Promise<{ user: IUser; accessToken: string } | null> {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const user: IUser = {
      id: data.user._id,
      email: data.user.email,
      avatar: data.user.avatar,
      role: data.user.role,
    };
    if (isBrowser()) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return { user, accessToken: data.accessToken };
  } catch (error) {
    console.error("Error registering:", error);
    return null;
  }
}

// Lấy thông tin user
export async function fetchUser(): Promise<IUser | null> {
  try {
    const data = await fetchWithAuth<any>(`${API_BASE_URL}/users/userinfo`, {
      cache: "no-store",
    });
    console.log("fetchUser response:", data);

    // Kiểm tra dữ liệu hợp lệ
    if (!data || !data._id) {
      throw new Error("Dữ liệu user không hợp lệ");
    }

    const user: IUser = {
      id: data._id,
      email: data.email,
      avatar: data.avatar,
      role: data.role,
    };
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function fetchAllUsers(): Promise<IUser[] | null> {
  try {
    const data = await fetchWithAuth<any[]>(`${API_BASE_URL}/users`, {
      cache: "no-store",
    });
    console.log("fetchAllUsers response:", data);

    // Kiểm tra dữ liệu hợp lệ
    if (!data || !Array.isArray(data)) {
      throw new Error("Dữ liệu users không hợp lệ");
    }

    const users: IUser[] = data.map((userData) => ({
      id: userData._id,
      email: userData.email,
      password:userData.password,
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
    // Tạo query string từ tham số
    const queryParams = new URLSearchParams();
    if (query.gender) queryParams.append("gender", query.gender);
    if (query.discount !== undefined) queryParams.append("discount", String(query.discount));
    if (query.name) queryParams.append("name", query.name);
    if (query.idcate) queryParams.append("idcate", query.idcate);
    if (query.limit) queryParams.append("limit", String(query.limit));
    if (query.page) queryParams.append("page", String(query.page));
    if (query.sort) queryParams.append("sort", query.sort);

    const url = `${API_BASE_URL}/products/?${queryParams.toString()}`;
    const temp = await fetchWithAuth<any>(url, { cache: "no-store" }, false); // Không cần auth
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

export async function addProduct(productData: Partial<IProduct>) {
  try {
    const data = await fetchWithAuth("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    return data;
  } catch (error: any) {
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
    const temp = await fetchWithAuth<any>(`${API_BASE_URL}/categories`, { cache: "no-store" }, false);
    if (!temp.data || !Array.isArray(temp.data)) {
      throw new Error("Dữ liệu danh mục không hợp lệ: temp.data không phải là mảng.");
    }
    const data: ICategory[] = temp.data.map((e: any) => ({
      id: e._id,
      name: e.name,
      description: e.description,
      img: e.img,
      parentId: e.parentId,
    }));
    console.log(data);
    
    return data;
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

export type { IUser };