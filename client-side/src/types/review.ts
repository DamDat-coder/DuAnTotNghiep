import { UserReview } from "./auth";
import { OrderReview } from "./order";
import { ProductReview } from "./product";

export interface IReview {
  _id: string;
  userId: UserReview;
  productId: ProductReview[];
  orderId: OrderReview;
  content: string;
  rating: number;
  status: "approved" | "spam";
  images?: string[];
  createdAt: string;
  updatedAt: string;
  adminReply?: {
    content: string;
    createdAt: string;
  };
}
