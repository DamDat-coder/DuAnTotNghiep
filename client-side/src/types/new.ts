import { IUser } from "./auth";
import { ICategoryNews } from "./category";

export type NewsFilterStatus = "all" | "published" | "draft" | "upcoming";

export interface News {
  _id: string | null;
  id: string;
  user_id: IUser;
  title: string;
  content: string;
  slug: string;
  category_id: ICategoryNews;
  date: string;
  status: "published" | "draft" | "upcoming";
  thumbnail?: string | null;
  tags?: string[];
  news_image?: string[];
  createdAt?: string;
  updatedAt?: string;
  is_published?: boolean;
  published_at?: Date;
}

export interface NewsPayload {
  title: string;
  content: string;
  slug: string;
  category_id: ICategoryNews;
  tags?: string[];
  is_published?: boolean;
  files?: File[];
  thumbnail?: string | null;
}
