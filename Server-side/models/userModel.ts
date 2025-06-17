import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  addresses: {
    street: string;
    city: string;
    country: string;
    is_default: boolean;
  }[];
  phone: number | null;
  role: "user" | "admin";
  is_active: boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        is_default: { type: Boolean, default: false },
      },
    ],
    phone: {
      type: Number,
      default: null,
      unique: true,
      sparse: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    is_active: { type: Boolean, default: true },
  },
  { versionKey: false }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
