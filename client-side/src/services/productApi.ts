import { API_BASE_URL, fetchWithAuth } from "./api";
import { IProduct } from "../types/product";

interface PaginatedProducts {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Ánh xạ tên danh mục sang categoryId
const categoryMap: Record<string, string> = {
  Nam: "684d09c1543e02998d9df014",
  Nữ: "684d09d5543e02998d9df016",
  Unisex: "684d09e4543e02998d9df018",
};

export async function fetchProducts(
  query: {
    category?: string;
    name?: string;
    idcate?: string;
    limit?: number;
    page?: number;
    sort?: "price-asc" | "price-desc" | "newest" | "best-seller";
    color?: string;
    size?: string;
    priceRange?: string;
  } = {}
): Promise<PaginatedProducts> {
  try {
    const queryParams = new URLSearchParams();
    if (query.category && categoryMap[query.category]) {
      queryParams.append("idcate", categoryMap[query.category]);
    }
    if (query.name) queryParams.append("name", query.name);
    if (query.idcate) queryParams.append("idcate", query.idcate);
    if (query.limit) queryParams.append("limit", String(query.limit));
    if (query.page) queryParams.append("page", String(query.page));
    if (query.sort) queryParams.append("sort", query.sort);
    if (query.color) queryParams.append("color", query.color);
    if (query.size) queryParams.append("size", query.size);
    if (query.priceRange) queryParams.append("priceRange", query.priceRange);

    const url = `${API_BASE_URL}/products/?${queryParams.toString()}`;
    const response = await fetchWithAuth<any>(
      url,
      { cache: "no-store" },
      false
    );

    const products: IProduct[] = response.data.map((e: any) => ({
      id: e._id,
      name: e.name,
      slug: e.slug,
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
      })),
      images: e.image || [],
      stock: e.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0,
    }));

    return {
      products,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  }
}

export async function addProduct(product: {
  name: string;
  slug: string;
  categoryId: string;
  variants: {
    price: number;
    color: string;
    size: string;
    stock: number;
    discountPercent?: number;
  }[];
  images: File[];
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

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    return {
      id: res.data._id,
      name: res.data.name,
      slug: res.data.slug,
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
    categoryId?: string;
    variants?: {
      price: number;
      color: string;
      size: string;
      stock: number;
      discountPercent?: number;
    }[];
    images?: File[];
  }
): Promise<IProduct | null> {
  try {
    const formData = new FormData();
    if (product.name) formData.append("name", product.name);
    if (product.slug) formData.append("slug", product.slug);
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

    const res = await fetchWithAuth<any>(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      body: formData,
    });

    const updatedProduct: IProduct = {
      id: res.data._id,
      name: res.data.name,
      slug: res.data.slug,
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
  slug: string
): Promise<IProduct | null> {
  try {
    const response = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/slug/${slug}`,
      { cache: "no-store" },
      false
    );

    const product: IProduct = {
      id: response.data._id,
      name: response.data.name,
      slug: response.data.slug,
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
    };

    return product;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo slug:", error);
    return null;
  }
}
