import { ICategory } from "../types";
import { API_BASE_URL, fetchWithAuth } from "./api";
interface CategoryResponse {
  status: string;
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type cho phản hồi khi thêm/cập nhật danh mục
interface SingleCategoryResponse {
  status: string;
  message: string;
  data: any;
}

// Type cho dữ liệu gửi lên khi thêm/cập nhật danh mục
interface CategoryInput {
  name: string;
  description?: string;
  parentId?: string | null;
}

// Lấy danh mục
export async function fetchCategories(): Promise<ICategory[]> {
  try {
    const response = await fetchWithAuth<CategoryResponse>(
      `${API_BASE_URL}/categories`,
      {
        cache: "no-store",
      },
      false
    );
    return response.data.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description || "",
      parentId: item.parentId || null,
    }));
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Thêm danh mục
export async function addCategory(category: CategoryInput): Promise<ICategory> {
  try {
    const body = {
      name: category.name,
      description: category.description,
      parentId: category.parentId || null,
    };

    console.log('Sending category:', body);

    const response = await fetchWithAuth<SingleCategoryResponse>(
      `${API_BASE_URL}/categories`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      true
    );

    return {
      id: response.data._id,
      name: response.data.name,
      description: response.data.description || "",
      parentId: response.data.parentId || null,
    };
  } catch (error: any) {
    console.error("Error adding category:", error);
    throw new Error(error.message || "Không thể thêm danh mục");
  }
}

// Cập nhật danh mục
export async function updateCategory(id: string, category: CategoryInput): Promise<ICategory> {
  try {
    const body: any = {};
    if (category.name) body.name = category.name;
    if (category.description) body.description = category.description;
    if (category.parentId !== undefined) body.parentId = category.parentId || null;

    console.log('Sending category update:', body);

    const response = await fetchWithAuth<SingleCategoryResponse>(
      `${API_BASE_URL}/categories/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      true
    );

    return {
      id: response.data._id,
      name: response.data.name,
      description: response.data.description || "",
      parentId: response.data.parentId || null,
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    throw new Error(error.message || "Không thể cập nhật danh mục");
  }
}

export async function deleteCategory(id: number): Promise<SingleCategoryResponse> {
  const res = await fetchWithAuth(`${API_BASE_URL}/category/${id}`, {
    method: "DELETE",
  });
  return (res as Response).json();
}