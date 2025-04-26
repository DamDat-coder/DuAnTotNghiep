import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  discountPercent: number;
  categoryId: Types.ObjectId;
  image: string[];
}

const productSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      required: true,
    },
    image: [{ type: String }],
  },
  { versionKey: false }
);

productSchema.index({ name: 1, categoryId: 1 });

const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default ProductModel;
