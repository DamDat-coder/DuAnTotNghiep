import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
}

export interface IShippingAddress {
  street: string;
  ward: string;
  province: string;
  phone: string;
}

export interface IOrderInfo {
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  code?: string;
  email?: string;
  paymentMethod: "vnpay" | "zalopay" | "cod";
  shipping: number;
}

export interface ITransactionSummary {
  amount: number;
  bankCode?: string;
  gatewayTransactionId?: string;
}

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number;
  discount_amount?: number;
  status: "pending" | "canceled" | "success" | "failed" | "paid";
  transaction_code: string;
  gateway: "vnpay" | "zalopay" | "cod";
  transaction_data?: any;
  transaction_summary?: ITransactionSummary;
  paid_at?: Date;
  order_info?: IOrderInfo;
  couponCode?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true },
    ward: { type: String, required: true },
    province: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderInfoSchema = new Schema<IOrderInfo>(
  {
    shippingAddress: { type: shippingAddressSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "zalopay", "cod"],
      required: true,
    },
    shipping: { type: Number, required: true },
    code: { type: String, default: null },
    email: { type: String, default: null },
  },
  { _id: false }
);

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "canceled", "success", "failed", "paid"],
      default: "pending",
    },
    transaction_code: { type: String, required: true, unique: true },
    gateway: {
      type: String,
      enum: ["vnpay", "zalopay", "cod"],
      required: true,
    },
    transaction_data: { type: Schema.Types.Mixed, default: null },
    transaction_summary: {
      type: Object,
      default: {},
    },
    paid_at: { type: Date, default: null },
    order_info: { type: orderInfoSchema, default: null },
    couponCode: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);
