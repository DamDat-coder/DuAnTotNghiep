import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  parentId?: mongoose.Types.ObjectId | null;
  image?: string | null;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      default: null,
    },
    image: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>("categories", categorySchema);
export default Category;