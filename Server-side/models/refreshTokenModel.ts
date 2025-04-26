import mongoose, { Document, Schema, Model, Types } from 'mongoose';

interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const refreshTokenSchema: Schema<IRefreshToken> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 }, 
  },
  { versionKey: false }
);

const RefreshTokenModel: Model<IRefreshToken> = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshTokenModel;
