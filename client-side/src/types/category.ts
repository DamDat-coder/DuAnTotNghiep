export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
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
  parentId?: string | null;
  is_active?: boolean;
}

//News
export interface ICategoryNews {
  _id: string;
  name: string;
}

export interface CategoryProduct {
  _id: string;
  name: string;
}