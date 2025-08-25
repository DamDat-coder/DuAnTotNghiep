import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId | null;
  title: string;
  message: string;
  link?: string; 
  type?: string;
  is_read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    type: { type: String },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
