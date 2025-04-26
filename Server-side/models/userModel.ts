import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  address: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, default: null },
    phone: { 
      type: String, 
      default: null, 
      unique: true, 
      sparse: true, 
    },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { versionKey: false }
);

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
