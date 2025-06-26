import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  transaction_code: string;
  transaction_data?: any;
  paid_at?: Date;
  order_info?: any;
  created_at?: Date;
  updated_at?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    transaction_code: { type: String, required: true, unique: true },
    transaction_data: { type: Schema.Types.Mixed, default: null },
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
