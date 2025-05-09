import { ICategory } from "../types";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Type cho phản hồi API
interface CategoryResponse {
  status: string;
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
      img: item.img || "",
      parentId: item.parentId || null,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}