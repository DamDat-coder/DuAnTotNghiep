import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  category: {
    _id: Types.ObjectId;
    name: string;
  };
  name: string;
  description?: string;
  image: string[];
  variants: {
    price: number;
    color: 'Đen' | 'Trắng' | 'Xám' | 'Đỏ';
    size: 'S' | 'M' | 'L' | 'XL';
    stock: number;
    discountPercent: number;
  }[];
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
          enum: ['Đen', 'Trắng', 'Xám', 'Đỏ'],
          required: true,
        },
        size: {
          type: String,
          enum: ['S', 'M', 'L', 'XL'],
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
  },
  { versionKey: false }
);

productSchema.index({ name: 1, 'category._id': 1 });

const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default ProductModel;