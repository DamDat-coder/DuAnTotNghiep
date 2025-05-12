import { IProduct } from "../types";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Lấy danh sách sản phẩm
export async function fetchProducts(
  query: {
    gender?: string;
    discount?: boolean;
    name?: string;
    idcate?: string;
    limit?: number;
    page?: number;
    sort?: "asc" | "desc";
  } = {}
): Promise<IProduct[]> {
  try {
    const queryParams = new URLSearchParams();
    if (query.gender) queryParams.append("gender", query.gender);
    if (query.discount !== undefined)
      queryParams.append("discount", String(query.discount));
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
      images: e.image,
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
  sizes: string[];
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
    product.sizes.forEach((size) => formData.append("sizes", size));
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
    const temp = await fetchWithAuth<any>(
      `${API_BASE_URL}/products/${id}`,
      { cache: "no-store" },
      false
    );
    const product: IProduct = {
      id: temp._id,
      categoryId: temp.categoryId?.$oid || temp.categoryId,
      name: temp.name,
      category: temp.categoryId?.name || "Không rõ",
      price: temp.price,
      sizes: temp.sizes || [],
      discountPercent: temp.discountPercent,
      images: temp.image,
    };
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

// Chỉnh sửa sản phẩm
export async function editProduct(
  id: string,
  product: {
    name?: string;
    categoryId?: string;
    price?: number;
    discountPercent?: number;
    sizes?: string[];
    images?: File[];
  }
): Promise<IProduct | null> {
  try {
    console.log("editProduct - Input data:", product);
    const formData = new FormData();
    if (product.name) formData.append("name", product.name);
    if (product.categoryId) formData.append("categoryId", product.categoryId);
    if (product.price !== undefined) formData.append("price", product.price.toString());
    if (product.discountPercent !== undefined) {
      formData.append("discountPercent", product.discountPercent.toString());
    }
    if (product.sizes) {
      // Chuẩn hóa sizes: "Size S" -> "S"
      const normalizedSizes = product.sizes.map((size) =>
        size.replace("Size ", "")
      );
      normalizedSizes.forEach((size) => formData.append("sizes", size));
    }
    if (product.images) {
      product.images.forEach((image, index) => {
        formData.append("image", image);
      });
    }

    const res = await fetchWithAuth<IProduct>(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      body: formData,
    });

    console.log("editProduct - Response:", res);
    const updatedProduct: IProduct = {
      id: res.id || id,
      categoryId: res.categoryId,
      name: res.name,
      category: res.category || "Không rõ",
      price: res.price,
      sizes: res.sizes || [],
      discountPercent: res.discountPercent,
      images: res.images,
    };

    return updatedProduct;
  } catch (error) {
    console.error(`Error editing product ${id}:`, error);
    return null;
  }
}