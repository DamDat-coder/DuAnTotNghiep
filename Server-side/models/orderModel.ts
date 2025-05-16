import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IOrder extends Document {
  userId: Types.ObjectId;
  products: { productId: Types.ObjectId; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'success' | 'cancelled';
  shippingAddress: string;
  paymentMethod: 'cod' | 'vnpay' | 'momo' | 'zalopay';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentDetails?: {
    transactionId?: string;
    paymentUrl?: string;
    timestamp?: Date;
  };
  coupon?: Types.ObjectId;
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'vnpay', 'momo', 'zalopay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: { type: String, required: false },
      paymentUrl: { type: String, required: false },
      timestamp: { type: Date, required: false },
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const OrderModel: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);
export default OrderModel;