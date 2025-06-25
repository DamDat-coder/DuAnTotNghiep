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

// // Thêm danh mục
// export async function addCategory(category: CategoryInput): Promise<ICategory> {
//   try {
//     const body = {
//       name: category.name,
//       description: category.description,
//       parentid: category.parentid || null,
//     };

//     console.log('Sending category:', body);

//     const response = await fetchWithAuth<SingleCategoryResponse>(
//       `${API_BASE_URL}/categories`,
//       {
//         method: "POST",
//         body: JSON.stringify(body),
//       },
//       true
//     );

//     return {
//       id: response.data._id,
//       name: response.data.name,
//       description: response.data.description || "",
//       parentid: response.data.parentid || null,
//     };
//   } catch (error: any) {
//     console.error("Error adding category:", error);
//     throw new Error(error.message || "Không thể thêm danh mục");
//   }
// }

// // Cập nhật danh mục
// export async function updateCategory(id: string, category: CategoryInput): Promise<ICategory> {
//   try {
//     const body: any = {};
//     if (category.name) body.name = category.name;
//     if (category.description) body.description = category.description;
//     if (category.parentid !== undefined) body.parentid = category.parentid || null;

//     console.log('Sending category update:', body);

//     const response = await fetchWithAuth<SingleCategoryResponse>(
//       `${API_BASE_URL}/categories/${id}`,
//       {
//         method: "PATCH",
//         body: JSON.stringify(body),
//       },
//       true
//     );

//     return {
//       id: response.data._id,
//       name: response.data.name,
//       description: response.data.description || "",
//       parentid: response.data.parentid || null,
//     };
//   } catch (error: any) {
//     console.error("Error updating category:", error);
//     throw new Error(error.message || "Không thể cập nhật danh mục");
//   }
// }

// export async function deleteCategory(id: number): Promise<SingleCategoryResponse> {
//   const res = await fetchWithAuth(`${API_BASE_URL}/category/${id}`, {
//     method: "DELETE",
//   });
//   return (res as Response).json();
// }

// export async function fetchCategoryById(id: string): Promise<ICategory | null> {
//   try {
//     const response = await fetchWithAuth<SingleCategoryResponse>(
//       `${API_BASE_URL}/categories/${id}`,
//       { cache: "no-store" },
//       false
//     );
//     if (response.data) {
//       return {
//         id: response.data._id,
//         name: response.data.name,
//         description: response.data.description || "",
//         parentid: response.data.parentid || null,
//       };
//     }
//     return null;
//   } catch (error) {
//     console.error("Error fetching category by id:", error);
//     return null;
//   }
// }

// // Lấy tất cả danh mục phẳng (API mới)
// export async function fetchCategoriesFlat(): Promise<ICategory[]> {
//   try {
//     const response = await fetchWithAuth<{ status: string; data: any[] }>(
//       `${API_BASE_URL}/categories/all/flat`,
//       { cache: "no-store" },
//       false
//     );
//     return response.data.map((item) => ({
//       id: item._id,
//       name: item.name,
//       description: item.description || "",
//       parentid: item.parentid || null,
//     }));
//   } catch (error) {
//     console.error("Error fetching categories (flat):", error);
//     return [];
//   }
// }