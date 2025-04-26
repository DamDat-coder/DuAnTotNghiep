import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  img?: string;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>("categories", categorySchema);
export default Category;