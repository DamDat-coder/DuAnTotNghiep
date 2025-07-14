import { UserReview } from "./auth";
import { ProductReview } from "./product";

export interface IReview {
  _id: string;
  userId: UserReview[]
  productId: ProductReview[]
  content: string;
  rating: number;
  status: "approved" | "spam";
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
