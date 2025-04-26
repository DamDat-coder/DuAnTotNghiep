import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INews extends Document {
  title: string;
  content: string;
  image?: string | null;
  author: Types.ObjectId;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema: Schema<INews> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    author: { type: Schema.Types.ObjectId, ref: "users", required: true },
    category: { type: Schema.Types.ObjectId, ref: "categories", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<INews>('news', newsSchema);
