import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  content: string;
  rating: number;
  images?: string[]; 
  status: "approved" | "spam";
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["approved", "spam"],
      default: "approved",
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
export default ReviewModel;
