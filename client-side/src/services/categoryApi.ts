import { CategoryInput, CategoryResponse, ICategory, SingleCategoryResponse } from "../types/category";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Lấy danh mục
export async function fetchCategoryTree(): Promise<ICategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error("API request failed");
    }
    return data.data as ICategory[];
  } catch (error) {
    console.error("Error fetching category tree:", error);
    throw error;
  }
}

// Chuyển cây danh mục thành danh sách phẳng
export function flattenCategories(categories: ICategory[]): ICategory[] {
  const flat: ICategory[] = [];
  function flatten(category: ICategory) {
    flat.push(category);
    category.children.forEach(flatten);
  }
  categories.forEach(flatten);
  return flat;
}

// Thêm danh mục
export async function addCategory(input: CategoryInput): Promise<ICategory> {
  try {
    // Chuẩn hóa parentId nếu FE truyền ""
    const body: any = {
      name: input.name,
      description: input.description,
      parentId: input.parentId === "" ? null : input.parentId ?? null,
    };

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
      children: [],
    };
  } catch (error: any) {
    console.error("Error adding category:", error);
    throw new Error(error.message || "Không thể thêm danh mục");
  }
}

// Cập nhật danh mục
export async function updateCategory(id: string, input: CategoryInput): Promise<ICategory> {
  try {
    const body: any = {};
    if (input.name) body.name = input.name;
    if (input.description) body.description = input.description;
    if (typeof input.parentId !== "undefined")
      body.parentId = input.parentId === "" ? null : input.parentId;

    const response = await fetchWithAuth<SingleCategoryResponse>(
      `${API_BASE_URL}/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      true
    );

    return {
      _id: response.data._id,
      name: response.data.name,
      description: response.data.description || "",
      parentId: response.data.parentId || null,
      children: [],
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    throw new Error(error.message || "Không thể cập nhật danh mục");
  }
}
