import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
  street: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  addresses: Types.DocumentArray<IAddress>;
  phone: number | null;
  role: "user" | "admin";
  is_active: boolean;
  refreshToken?: string | null;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    is_default: { type: Boolean, default: false },
  },
  {
    _id: true,
  }
);

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    addresses: [addressSchema],
    phone: {
      type: Number,
      default: null,
      unique: true,
      sparse: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    is_active: { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default UserModel;
