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

export interface IShippingAddress {
  street: string;
  ward: string;
  district: string;
  province: string;
  is_default?: boolean;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  couponId?: Types.ObjectId | null;
  address_id: Types.ObjectId;
  shippingAddress: IShippingAddress;
  totalPrice: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'vnpay' | 'momo';
  paymentId?: Types.ObjectId | null;
  items: IOrderItem[];
  note?: string;
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

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    is_default: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    address_id: { type: Schema.Types.ObjectId, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    totalPrice: { type: Number, required: true },
    shipping: { type: Number, default: 0 }, 
    paymentMethod: {
      type: String,
      enum: ['cod', 'vnpay', 'momo', 'zalopay'], 
      required: true,
    },
    note: { type: String, default: '' }, 
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
