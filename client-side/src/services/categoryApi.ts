import { CategoryInput, ToggleCategoryResponse, ICategory, SingleCategoryResponse } from "../types/category";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Lấy cây danh mục
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
    if (category.children) category.children.forEach(flatten);
  }
  categories.forEach(flatten);
  return flat;
}

// Thêm danh mục
export async function addCategory(input: CategoryInput, imageFile?: File): Promise<ICategory> {
  try {
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description ?? "");
    // Nếu parentId là "" thì gửi null, còn undefined thì bỏ qua
    if (input.parentId !== undefined) {
      formData.append("parentId", input.parentId === "" ? "" : String(input.parentId));
    }
    if (typeof input.is_active === "boolean") {
      formData.append("is_active", String(input.is_active));
    }
    if (imageFile) {
      formData.append("image", imageFile); // "image" phải khớp tên Multer xử lý bên BE
    }

    const response = await fetchWithAuth<SingleCategoryResponse>(
      `${API_BASE_URL}/categories`,
      {
        method: "POST",
        body: formData,
        // KHÔNG set Content-Type, browser sẽ tự thêm multipart/form-data
      },
      true
    );

    return {
      _id: response.data._id,
      name: response.data.name,
      slug: response.data.slug,
      description: response.data.description || "",
      parentId: response.data.parentId || null,
      image: response.data.image || null,
      is_active: response.data.is_active,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      children: response.data.children || [],
    };
  } catch (error: any) {
    console.error("Error adding category:", error);
    throw new Error(error.message || "Không thể thêm danh mục");
  }
}

// Cập nhật danh mục
export async function updateCategory(id: string, input: CategoryInput, imageFile?: File): Promise<ICategory> {
  try {
    const formData = new FormData();
    if (input.name !== undefined) formData.append("name", input.name);
    if (input.description !== undefined) formData.append("description", input.description ?? "");
    if (input.parentId !== undefined) formData.append("parentId", input.parentId === "" ? "" : String(input.parentId));
    if (typeof input.is_active === "boolean") formData.append("is_active", String(input.is_active));
    if (imageFile) formData.append("image", imageFile);

    const response = await fetchWithAuth<SingleCategoryResponse>(
      `${API_BASE_URL}/categories/${id}`,
      {
        method: "PUT",
        body: formData,
        // KHÔNG set Content-Type
      },
      true
    );

    return {
      _id: response.data._id,
      name: response.data.name,
      slug: response.data.slug,
      description: response.data.description || "",
      parentId: response.data.parentId || null,
      image: response.data.image || null,
      is_active: response.data.is_active,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      children: response.data.children || [],
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    throw new Error(error.message || "Không thể cập nhật danh mục");
  }
}

// Toggle trạng thái (hoặc update is_active)
export async function toggleCategoryActive(id: string, isActive: boolean, force = false) {
  const json: ToggleCategoryResponse = await fetchWithAuth<ToggleCategoryResponse>(
    `${API_BASE_URL}/categories/${id}/lock`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive, force }),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (json.requiresConfirmation) {
    throw { warning: true, message: json.message };
  }

  return json.data;
}