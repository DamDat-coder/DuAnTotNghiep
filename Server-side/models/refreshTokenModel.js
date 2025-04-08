const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL Index, tự xóa khi hết hạn
});

const RefreshTokenModel = mongoose.model("refreshTokens", refreshTokenSchema);
module.exports = RefreshTokenModel;