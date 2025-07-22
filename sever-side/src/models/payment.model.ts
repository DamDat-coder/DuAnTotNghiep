import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransactionSummary {
  amount: number;
  bankCode?: string;
  gatewayTransactionId?: string;
}

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number;
  discount_amount?: number;
  status: 'pending' | 'canceled' |'success' | 'failed' | 'paid';
  transaction_code: string;
  gateway: 'vnpay' | 'zalopay' | 'cod';
  transaction_data?: any;
  transaction_summary?: ITransactionSummary;
  paid_at?: Date;
  order_info?: any;
  created_at?: Date;
  updated_at?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'canceled', 'success', 'failed', 'paid'],
      default: 'pending',
    },
    transaction_code: { type: String, required: true, unique: true },
    gateway: {
      type: String,
      enum: ['vnpay', 'zalopay', 'cod'],
      required: true,
    },
    transaction_data: { type: Schema.Types.Mixed, default: null },
    transaction_summary: {
      type: Object,
      default: {},
    },
    paid_at: { type: Date, default: null },
    order_info: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
