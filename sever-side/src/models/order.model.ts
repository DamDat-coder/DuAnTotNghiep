import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  couponId?: Types.ObjectId | null;
  address_id: Types.ObjectId;
  shippingAddress: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentId?: Types.ObjectId | null;
  items: IOrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    address_id: { type: Schema.Types.ObjectId, required: true },
    shippingAddress: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>('Order', orderSchema);
export default OrderModel;
