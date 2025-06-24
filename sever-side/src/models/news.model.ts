import mongoose, { Schema, Document, Types } from "mongoose";

export interface INews extends Document {
  title: string;
  content: string;
  slug: string;
  thumbnail?: string | null;
  user_id: Types.ObjectId;
  category_id: Types.ObjectId;
  tags?: string[];
  news_image?: string[];
  is_published: boolean;
  published_at?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema: Schema<INews> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String, default: null },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "categories", required: true },
    tags: [{ type: String }],
    news_image: [{ type: String }],
    is_published: { type: Boolean, default: false },
    published_at: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<INews>("news", newsSchema);
