const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { versionKey: false });

module.exports = mongoose.model("users", userSchema);