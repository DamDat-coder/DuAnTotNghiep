import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  category: {
    _id: Types.ObjectId;
    name: string;
  };
  name: string;
  slug: string;
  description?: string;
  image: string[];
  variants: {
    price: number;
    color: 'Đen' | 'Trắng' | 'Xám' | 'Đỏ' | 'Xanh da trời' | 'Nâu' | 'Hồng';
    size: 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
    stock: number;
    discountPercent: number;
  }[];
  is_active: boolean;
  salesCount: number;
}

const productSchema: Schema<IProduct> = new Schema(
  {
    category: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: [
      {
        type: String,
      },
    ],
    variants: [
      {
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        color: {
          type: String,
          enum: ['Đen', 'Trắng', 'Xám', 'Đỏ', 'Xanh da trời', 'Nâu', 'Hồng'],
          required: true,
        },
        size: {
          type: String,
          enum: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPercent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
          default: 0,
        },
      },
    ],
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    salesCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { versionKey: false }
);

productSchema.index({ name: 1, 'category._id': 1 });
productSchema.index({ salesCount: -1 }); 

const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default ProductModel;