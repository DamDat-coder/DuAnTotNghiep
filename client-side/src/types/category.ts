export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  children: ICategory[];
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

//News
export interface ICategoryNews {
  _id: string;
  name: string;
}
