import { API_BASE_URL, fetchWithAuth } from "./api";
import { IProduct } from "../types/product";
interface ProductQuery {
  id_cate?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort_by?: "newest" | "oldest" | "price_asc" | "price_desc" | "best_selling";
  is_active?: boolean;
  limit?: number;
}

interface ProductResponse {
  success: boolean;
  total: number;
  data: IProduct[];
}

// Tách hàm map dữ liệu
function mapToIProduct(e: any): IProduct {
  return {
    id: e._id,
    name: e.name,
    slug: e.slug,
    description: e.description || "",
    category: {
      _id: e.category?._id || null,
      name: e.category?.name || "Không rõ",
    },
    categoryId: e.category?._id || null,
    variants: (e.variants || []).map((v: any) => ({
      price: v.price,
      color: v.color,
      size: v.size,
      stock: v.stock,
      discountPercent: v.discountPercent ?? 0,
      discountedPrice:
        v.discountedPrice ??
        Math.round(v.price * (1 - (v.discountPercent ?? 0) / 100)),
    })),
    images: Array.isArray(e.image) ? e.image : e.images || [],
    is_active: e.is_active ?? true,
    salesCount: e.salesCount || 0,
  };
}

export async function fetchProducts(
  query: ProductQuery = { is_active: true }
): Promise<ProductResponse> {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, encodeURIComponent(value.toString()));
      }
    });

    const response = await fetchWithAuth<{
      success: boolean;
      total: number;
      data: any[];
    }>(`${API_BASE_URL}/products?${params.toString()}`, { cache: "no-store" });
    // Loại bỏ sản phẩm trùng lặp dựa trên _id
    const uniqueProducts = Array.from(
      new Map(response.data.map((product) => [product._id, product])).values()
    );

    return {
      success: response.success,
      total: uniqueProducts.length,
      data: uniqueProducts.map((product) => ({
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        categoryId: product.category?._id || null,
        category: {
          _id: product.category?._id || null,
          name: product.category?.name || "",
        },
        variants: product.variants.map((variant: any) => ({
          price: variant.price,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          discountPercent: variant.discountPercent || 0,
          discountedPrice: Math.round(
            variant.price * (1 - (variant.discountPercent || 0) / 100)
          ),
        })),
        images: product.image || [],
        salesCount: product.salesCount || 0,
        is_active: product.is_active,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    throw new Error(error.message || "Không thể tải sản phẩm");
  }
}

// Các hàm khác (addProduct, fetchProductById, editProduct, deleteProduct, fetchProductBySlug) giữ nguyên
export async function addProduct(product: {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  variants: {
    price: number;
    color: string;
    size: string;
    stock: number;
    discountPercent?: number;
  }[];
  images: File[];
  is_active?: boolean;
}): Promise<IProduct | null> {
  try {
    if (
      !product.name ||
      !product.slug ||
      !product.variants?.length ||
      !product.images?.length
    ) {
      throw new Error(
        "Thiếu thông tin bắt buộc: name, slug, variants, hoặc images"
      );
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("slug", product.slug);
    if (product.description)
      formData.append("description", product.description);
    formData.append("category._id", product.categoryId);

    formData.append("variants", JSON.stringify(product.variants));
    product.images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("is_active", String(product.is_active ?? true));

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    return mapToIProduct(res.data);
  } catch (error: any) {
    // --- XỬ LÝ TRÙNG SLUG ---
    // Nếu dùng fetchWithAuth trả về error.response.status hoặc BE trả về message trùng slug
    if (
      (error?.response && error.response.status === 409) ||
      (typeof error?.message === "string" &&
        (error.message.includes("slug") ||
          error.message.includes("đã tồn tại")))
    ) {
      throw new Error("SLUG_EXISTS");
    }

    // Các lỗi khác throw lại để FE xử lý chung
    throw error;
  }
}

export async function fetchProductById(id: string): Promise<IProduct | null> {
  try {
    const response = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/${id}`,
      { cache: "no-store" },
      false
    );

    const product: IProduct = {
      id: response.data._id,
      name: response.data.name,
      slug: response.data.slug,
      description: response.data.description || "",
      category: {
        _id: response.data.category?._id || null,
        name: response.data.category?.name || "Không rõ",
      },
      categoryId: response.data.category?._id || null,
      variants: (response.data.variants || []).map((v: any) => ({
        price: v.price,
        color: v.color,
        size: v.size,
        stock: v.stock,
        discountPercent: v.discountPercent ?? 0,
      })),
      images: response.data.image || [],
      is_active: response.data.is_active ?? true,
      salesCount: response.data.salesCount || 0,
    };

    return product;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    return null;
  }
}
export async function fetchProductsActiveStatus(
  productIds: string[]
): Promise<{ id: string; is_active: boolean }[]> {
  try {
    const response = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/active-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }),
      },
      false
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái sản phẩm:", error);
    return productIds.map((id) => ({ id, is_active: true }));
  }
}

export async function editProduct(
  id: string,
  product: {
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    variants?: {
      price: number;
      color: string;
      size: string;
      stock: number;
      discountPercent?: number;
    }[];
    images?: File[];
    is_active?: boolean;
  }
): Promise<IProduct | null> {
  try {
    const formData = new FormData();
    if (product.name) formData.append("name", product.name);
    if (product.slug) formData.append("slug", product.slug);
    if (product.description)
      formData.append("description", product.description);
    // ĐÚNG: nên gửi category._id đúng BE mong đợi
    if (product.categoryId) formData.append("category._id", product.categoryId);
    if (product.variants) {
      formData.append("variants", JSON.stringify(product.variants));
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        formData.append("images", image);
      });
    }
    if (product.is_active !== undefined)
      formData.append("is_active", String(product.is_active));

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    return mapToIProduct(res.data);
  } catch (error: any) {
    console.error(`Lỗi khi chỉnh sửa sản phẩm ${id}:`, error);
    throw new Error(error.message || "Đã xảy ra lỗi khi chỉnh sửa sản phẩm");
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error: any) {
    console.error(`Lỗi khi xóa sản phẩm ${id}:`, error);
    const message = error.message || "Đã xảy ra lỗi khi xóa sản phẩm";
    throw new Error(message);
  }
}

export async function fetchProductBySlug(
  slug: string,
  exact: boolean = true // Mặc định tìm chính xác
): Promise<IProduct | IProduct[] | null> {
  try {
    const response = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/slug/${slug}?exact=${exact}`,
      { cache: "no-store" },
      false
    );

    if (exact) {
      // Tìm chính xác: trả về một sản phẩm
      const product = response.data;
      return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        category: {
          _id: product.category?._id || null,
          name: product.category?.name || "Không rõ",
        },
        categoryId: product.category?._id || null,
        variants: (product.variants || []).map((v: any) => ({
          price: v.price,
          color: v.color,
          size: v.size,
          stock: v.stock,
          discountPercent: v.discountPercent ?? 0,
          discountedPrice: v.discountedPrice ?? 0,
        })),
        images: product.image || [],
        is_active: product.is_active ?? true,
        salesCount: product.salesCount || 0,
      };
    } else {
      // Tìm gần đúng: trả về danh sách sản phẩm
      return response.data.map(mapToIProduct);
    }
  } catch (error) {
    return null;
  }
}

export async function lockProduct(id: string, is_active: boolean) {
  try {
    const res = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/${id}/lock`,
      {
        // <-- Sửa ở đây!
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi cập nhật trạng thái!");
  }
}

export async function fetchProductsAdmin(
  query: ProductQuery = {}
): Promise<ProductResponse> {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, encodeURIComponent(value.toString()));
      }
    });

    // API route dành riêng cho admin
    const response = await fetchWithAuth<{
      success: boolean;
      total: number;
      data: any[];
    }>(`${API_BASE_URL}/products/admin?${params.toString()}`, {
      cache: "no-store",
    });

    // Loại bỏ sản phẩm trùng lặp dựa trên _id
    const uniqueProducts = Array.from(
      new Map(response.data.map((product) => [product._id, product])).values()
    );

    return {
      success: response.success,
      total: uniqueProducts.length,
      data: uniqueProducts.map((product) => ({
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        categoryId: product.category?._id || null,
        category: {
          _id: product.category?._id || null,
          name: product.category?.name || "",
        },
        variants: product.variants.map((variant: any) => ({
          price: variant.price,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          discountPercent: variant.discountPercent || 0,
          discountedPrice: Math.round(
            variant.price * (1 - (variant.discountPercent || 0) / 100)
          ),
        })),
        images: product.image || [],
        salesCount: product.salesCount || 0,
        is_active: product.is_active,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching products (admin):", error);
    throw new Error(error.message || "Không thể tải sản phẩm (admin)");
  }
}

// Hàm lấy categoryId từ API nếu thiếu
export const fetchProductCategory = async (
  productId: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    const product = await response.json();
    return product.category._id || "";
  } catch (error) {
    console.error("DEBUG fetchProductCategory - Error", { productId, error });
    return "";
  }
};
