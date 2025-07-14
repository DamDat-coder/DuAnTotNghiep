import { IUser } from "./auth";
import { ICategoryNews } from "./category";

export type NewsFilterStatus = "all" | "published" | "draft";

export interface News {
  _id: string | null;
  id: string;
  user_id: IUser;
  title: string;
  content: string;
  slug: string;
  category_id: ICategoryNews;
  date: string;
  status: "published" | "draft";
  thumbnail?: string | null;
  tags?: string[];
  news_image?: string[];
  createdAt?: string;
  updatedAt?: string;
  is_published?: boolean;
  published_at?: Date;
  meta_description: string;
}

export interface NewsPayload {
  title: string;
  content: string;
  slug: string;
  category_id: { _id: string; name?: string };
  tags?: string[];
  is_published?: boolean;
  thumbnail?: File;
  news_image?: File[];
  published_at?: Date;
  meta_description: string;
}

export interface NewsProduct {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}