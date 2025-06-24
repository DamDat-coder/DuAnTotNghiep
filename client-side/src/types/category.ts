export interface ICategory {
  id: string;
  name: string;
  description: string;
  parentid: string | null;
}
export interface CategoryResponse {
  status: string;
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type cho phản hồi khi thêm/cập nhật danh mục
export interface SingleCategoryResponse {
  status: string;
  message: string;
  data: any;
}

// Type cho dữ liệu gửi lên khi thêm/cập nhật danh mục
export interface CategoryInput {
  name: string;
  description?: string;
  parentid?: string | null;
}