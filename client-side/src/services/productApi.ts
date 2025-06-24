import { API_BASE_URL, fetchWithAuth } from "./api";
import { IProduct } from "../types/product";

interface ProductResponse {
  products: IProduct[];
  total: number;
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
      discountedPrice: v.discountedPrice ?? 0,
    })),
    images: Array.isArray(e.image) ? e.image : e.images || [],
    stock: (e.variants || []).reduce(
      (sum: number, v: any) => sum + (v.stock || 0),
      0
    ),
    is_active: e.is_active ?? true,
    salesCount: e.salesCount || 0,
  };
}

export async function fetchProducts(
  query: {
    category?: string;
    name?: string;
    id_cate?: string;
    slug?: string;
    sort?: "price-asc" | "price-desc" | "newest" | "best-seller";
    color?: string;
    size?: string;
    priceRange?: string;
  } = {}
): Promise<ProductResponse> {
  try {
    const queryParams = new URLSearchParams();
    // Chỉ append id_cate 1 lần duy nhất
    const idCate = query.id_cate;
    if (idCate) queryParams.append("id_cate", idCate);
    if (query.name) queryParams.append("name", query.name);
    if (query.sort) queryParams.append("sort", query.sort);
    if (query.color) queryParams.append("color", query.color);
    if (query.size) queryParams.append("size", query.size);
    if (query.slug) queryParams.append("slug", query.slug);
    if (query.priceRange) queryParams.append("priceRange", query.priceRange);
    queryParams.append("is_active", "true");

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
    const response = await fetchWithAuth<any>(
      url,
      { cache: "no-store" },
      false
    );

    return {
      products: Array.isArray(response.data)
        ? response.data.map(mapToIProduct)
        : [],
      total: response.total || 0,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return {
      products: [],
      total: 0,
    };
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
    formData.append("category[_id]", product.categoryId);
    product.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][price]`, variant.price.toString());
      formData.append(`variants[${index}][color]`, variant.color);
      formData.append(`variants[${index}][size]`, variant.size);
      formData.append(`variants[${index}][stock]`, variant.stock.toString());
      formData.append(
        `variants[${index}][discountPercent]`,
        (variant.discountPercent ?? 0).toString()
      );
    });
    product.images.forEach((image) => {
      formData.append("image", image);
    });
    formData.append("is_active", String(product.is_active ?? true));

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    return {
      id: res.data._id,
      name: res.data.name,
      slug: res.data.slug,
      description: res.data.description || "",
      category: {
        _id: res.data.category?._id || null,
        name: res.data.category?.name || "Không rõ",
      },
      categoryId: res.data.category?._id || null,
      variants: (res.data.variants || []).map((v: any) => ({
        price: v.price,
        color: v.color,
        size: v.size,
        stock: v.stock,
        discountPercent: v.discountPercent ?? 0,
      })),
      images: res.data.image || [],
      stock:
        res.data.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) ||
        0,
      is_active: res.data.is_active ?? true,
      salesCount: res.data.salesCount || 0,
    };
  } catch (error: any) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    const message = error.message || "Đã xảy ra lỗi khi thêm sản phẩm";
    if (message.includes("Tên hoặc slug sản phẩm đã tồn tại")) {
      throw new Error("Tên hoặc slug sản phẩm đã tồn tại");
    }
    if (message.includes("Danh mục không tồn tại")) {
      throw new Error("Danh mục không tồn tại");
    }
    throw new Error(message);
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
      stock:
        response.data.variants?.reduce(
          (sum: number, v: any) => sum + v.stock,
          0
        ) || 0,
      is_active: response.data.is_active ?? true,
      salesCount: response.data.salesCount || 0,
    };

    return product;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    return null;
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
    if (product.categoryId)
      formData.append("category[_id]", product.categoryId);
    if (product.variants) {
      product.variants.forEach((variant, index) => {
        formData.append(`variants[${index}][price]`, variant.price.toString());
        formData.append(`variants[${index}][color]`, variant.color);
        formData.append(`variants[${index}][size]`, variant.size);
        formData.append(`variants[${index}][stock]`, variant.stock.toString());
        formData.append(
          `variants[${index}][discountPercent]`,
          (variant.discountPercent ?? 0).toString()
        );
      });
    }
    if (product.images) {
      product.images.forEach((image) => {
        formData.append("image", image);
      });
    }
    if (product.is_active !== undefined)
      formData.append("is_active", String(product.is_active));

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      body: formData,
    });

    const updatedProduct: IProduct = {
      id: res.data._id,
      name: res.data.name,
      slug: res.data.slug,
      description: res.data.description || "",
      category: {
        _id: res.data.category?._id || null,
        name: res.data.category?.name || "Không rõ",
      },
      categoryId: res.data.category?._id || null,
      variants: (res.data.variants || []).map((v: any) => ({
        price: v.price,
        color: v.color,
        size: v.size,
        stock: v.stock,
        discountPercent: v.discountPercent ?? 0,
      })),
      images: res.data.image || [],
      stock:
        res.data.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) ||
        0,
      is_active: res.data.is_active ?? true,
      salesCount: res.data.salesCount || 0,
    };

    return updatedProduct;
  } catch (error: any) {
    console.error(`Lỗi khi chỉnh sửa sản phẩm ${id}:`, error);
    const message = error.message || "Đã xảy ra lỗi khi chỉnh sửa sản phẩm";
    if (message.includes("Tên hoặc slug sản phẩm đã tồn tại")) {
      throw new Error("Tên hoặc slug sản phẩm đã tồn tại");
    }
    if (message.includes("Danh mục không tồn tại")) {
      throw new Error("Danh mục không tồn tại");
    }
    throw new Error(message);
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
        stock:
          (product.variants || []).reduce(
            (sum: number, v: any) => sum + v.stock,
            0
          ) || 0,
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
    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi cập nhật trạng thái!");
  }
}
