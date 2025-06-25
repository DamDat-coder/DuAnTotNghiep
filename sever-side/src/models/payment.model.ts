import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: Types.ObjectId; 
  userId: Types.ObjectId;
  method: 'cash' | 'credit_card' | 'vnpay' | 'momo';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string; 
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    method: {
      type: String,
      enum: ['cash', 'credit_card', 'vnpay', 'momo'],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    transactionId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema);
export default PaymentModel;
