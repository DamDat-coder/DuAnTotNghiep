import mongoose, {
  Document,
  Schema,
  Model,
  Types,
} from "mongoose";

export interface IAddress extends Types.Subdocument {
  _id: Types.ObjectId;
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
  wishlist: Types.ObjectId[];
  googleId?: string;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: false, trim: true },
    ward: { type: String, required: false, trim: true },
    district: { type: String, required: false, trim: true },
    province: { type: String, required: false, trim: true },
    is_default: { type: Boolean, default: false },
  },
  {
    _id: true,
  }
);

const userSchema = new Schema<IUser>(
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
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    googleId: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ role: 1 });
userSchema.index({ is_active: 1 });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });
const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default UserModel;
