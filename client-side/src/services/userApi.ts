import { Address, IUser, UpdateUserData, UserData } from "../types/auth";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";
import { fetchProductById } from "./productApi";
import { IProduct } from "@/types/product";

interface AddAddressResponse {
  message: string;
  data: Address[];
}
// Interface cho response cập nhật địa chỉ mặc định
interface UpdateDefaultAddressResponse {
  message: string;
  data: Address;
}
// Interface cho response cập nhật địa chỉ mặc định
interface UpdateDefaultAddressResponse {
  message: string;
  data: Address;
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
      is_active: data.data.user.is_active,
      active: data.data.user.is_active,
      addresses: [],
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

export const googleLogin = async (id_token: string) => {
  const res = await fetch(`${API_BASE_URL}/users/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google login failed: ${text}`);
  }

  const data = await res.json();
  const user: IUser = {
    id: data.data.user._id,
    email: data.data.user.email,
    name: data.data.user.name,
    phone: data.data.user.phone || null,
    role: data.data.user.role,
    active: data.data.user.is_active,
    addresses: [],
    is_active: true,
  };

  if (isBrowser()) {
    localStorage.setItem("accessToken", data.data.accessToken);
    document.cookie = `refreshToken=${data.data.refreshToken}; path=/; max-age=3600`;
  }

  return { user, accessToken: data.data.accessToken };
};

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
      addresses: [],
      is_active: true,
    };
    console.log("User - Register" + user.id);

    console.log("AccessToken - Register" + data.data.accessToken);
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

    const user = {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone || null,
      role: data.user.role,
      is_active: data.user.is_active,
      active: data.user.is_active,
      addresses: data.user.addresses || [],
    };

    return user;
  } catch (error: any) {
    console.error("fetchUser - Error:", error.message);
    return null;
  }
}

export async function fetchAllUsers(): Promise<IUser[] | null> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/users`, {
      cache: "no-store",
    });

    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Invalid data:", response);
      return null;
    }

    const users: IUser[] = response.data.map((userData: UserData) => ({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      role: userData.role,
      is_active: userData.is_active,
      active: userData.is_active,
      addresses: userData.addresses || [],
    }));
    return users;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<IUser | null> {
  let returnValue = null;
  try {
    const token = localStorage.getItem("accessToken");

    // Nếu không có token, trả về null hoặc có thể thông báo người dùng đăng nhập lại
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return returnValue;
    }

    // Gửi yêu cầu PUT để cập nhật thông tin người dùng
    const result = await fetchWithAuth<{ user: IUser }>( // fetchWithAuth giờ trả về dữ liệu trực tiếp
      `${API_BASE_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    console.log("API response:", result);
    // Kiểm tra xem API có trả về dữ liệu hợp lệ không
    if (result && result.user) {
      returnValue = result.user;
    }
    return returnValue;
  } catch (error: any) {
    console.error("Cập nhật user thất bại:", error.message);
    return returnValue;
  }
}

export async function toggleUserStatus(userId: string, is_active: boolean) {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const result = await fetchWithAuth<{ success: boolean; data: IUser }>(
      `${API_BASE_URL}/users/${userId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      }
    );

    if (result && result.success) {
      return result.data; // Trả về người dùng đã cập nhật
    } else {
      throw new Error("Không thể cập nhật trạng thái người dùng.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    return null;
  }
}

export async function addAddress(
  userId: string,
  addressData: any
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Thêm địa chỉ thất bại:", error.message);
    return null;
  }
}

// Function to update an address for a user
export async function updateAddress(
  userId: string,
  addressId: string,
  addressData: any
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Cập nhật địa chỉ thất bại:", error.message);
    return null;
  }
}

// Function to delete an address for a user
export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<IUser | null> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Xoá địa chỉ thất bại.");
    }

    return data.data;
  } catch (error: any) {
    console.error("Xoá địa chỉ thất bại:", error.message);
    return null;
  }
}

// // Function to set a specific address as default
// export async function setDefaultAddress(
//   userId: string,
//   addressId: string
// ): Promise<IUser | null> {
//   try {
//     const token = localStorage.getItem("accessToken");
//     if (!token) {
//       console.error("Không có token. Vui lòng đăng nhập lại.");
//       return null;
//     }

//     const response = await fetch(
//       `${API_BASE_URL}/users/${userId}/addresses/${addressId}/default`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Cập nhật địa chỉ mặc định thất bại.");
//     }

//     return data.data;
//   } catch (error: any) {
//     console.error("Cập nhật địa chỉ mặc định thất bại:", error.message);
//     return null;
//   }
// }

export const addProductToWishlistApi = async (
  userId: string,
  productId: string
) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Thêm sản phẩm vào danh sách yêu thích thất bại."
      );
    }

    const data = await response.json(); // Trả về dữ liệu đã thêm vào wishlist
    return data;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào wishlist:", error);
    throw error;
  }
};

export const removeFromWishlistApi = async (
  userId: string,
  productId: string
) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không có token. Vui lòng đăng nhập lại.");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/wishlist/${productId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Xoá sản phẩm khỏi danh sách yêu thích thất bại."
      );
    }

    const data = await response.json(); // Trả về dữ liệu đã cập nhật wishlist
    return data;
  } catch (error) {
    console.error("Lỗi khi xoá sản phẩm khỏi wishlist:", error);
    throw error;
  }
};

export async function getWishlistFromApi(userId: string): Promise<IProduct[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Không có token. Vui lòng đăng nhập lại.");
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Lấy danh sách wishlist thất bại.");
  }

  const data = await response.json();
  if (!data || !data.data) {
    throw new Error("Không có dữ liệu wishlist.");
  }

  // The backend returns incomplete product data, so we need to fetch complete details
  const wishlistItems = data.data;
  const completeProducts: IProduct[] = [];

  // Fetch complete product details for each item in wishlist
  for (const item of wishlistItems) {
    try {
      const productId = item._id || item.id;
      const completeProduct = await fetchProductById(productId);
      if (completeProduct) {
        completeProducts.push(completeProduct);
      }
    } catch (error) {
      console.error(
        `Failed to fetch complete product data for ID: ${item._id || item.id}`,
        error
      );
      // If we can't fetch complete data, use the limited data we have
      const transformedItem = {
        ...item,
        id: item._id || item.id,
        category: item.category || {
          _id: null,
          name: "Danh mục không xác định",
        },
        variants: item.variants || [],
        images: item.image || item.images || [],
        is_active: item.is_active ?? true,
        salesCount: item.salesCount || 0,
        description: item.description || "",
        categoryId: item.category?._id || null,
        slug: item.slug || "",
      };
      completeProducts.push(transformedItem as IProduct);
    }
  }

  return completeProducts;
}

export async function addAddressWhenCheckout(
  userId: string,
  address: {
    street: string;
    ward: string;
    district: string;
    province: string;
    is_default: boolean;
  }
): Promise<Address> {
  if (!userId || userId === "undefined") {
    throw new Error("userId không hợp lệ");
  }
  try {
    const response = await fetchWithAuth<AddAddressResponse>(
      `${API_BASE_URL}/users/${userId}/addresses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      }
    );
    // Lấy địa chỉ mới nhất (phần tử cuối cùng của mảng data)
    const newAddress = response.data[response.data.length - 1];
    if (!newAddress || !newAddress._id) {
      throw new Error("Response không chứa address_id");
    }
    return {
      ...newAddress,
      _id: newAddress._id,
    };
  } catch (error: any) {
    console.error("Error adding address:", error);
    throw new Error(error.message || "Không thể thêm địa chỉ");
  }
}

// Cập nhật địa chỉ mặc định
export async function setDefaultAddress(
  userId: string,
  addressId: string
): Promise<Address> {
  if (!userId || !addressId) {
    throw new Error("userId hoặc addressId không hợp lệ");
  }
  try {
    const response = await fetchWithAuth<UpdateDefaultAddressResponse>(
      `${API_BASE_URL}/users/${userId}/addresses/${addressId}/default`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error setting default address:", error);
    throw new Error(error.message || "Không thể cập nhật địa chỉ mặc định");
  }
}

export async function fetchAllUsersAdmin(
  search: string = "", // Thêm tham số search
  page: number = 1, // Thêm tham số page
  limit: number = 10, // Thêm tham số limit
  role?: string, // Thêm tham số role (tùy chọn)
  is_active?: boolean 
): Promise<{
  users: IUser[] | null;
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    // Tạo query string từ các tham số
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }), // Chỉ thêm search nếu có giá trị
      ...(role && { role }), // Chỉ thêm role nếu có giá trị
      ...(typeof is_active !== "undefined" && {
        is_active: is_active.toString(),
      }), // Chỉ thêm is_block nếu được cung cấp
    });

    const response = await fetchWithAuth<any>(
      `${API_BASE_URL}/users?${queryParams.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("Dữ liệu không hợp lệ:", response);
      return { users: null, total: 0, totalPages: 0, currentPage: page };
    }

    const users: IUser[] = response.data.map((userData: UserData) => ({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      role: userData.role,
      is_active: userData.is_active,
      addresses: userData.addresses || [],
    }));

    return {
      users,
      total: response.total || 0,
      totalPages: response.totalPages || 0,
      currentPage: response.currentPage || page,
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return { users: null, total: 0, totalPages: 0, currentPage: page };
  }
}
