const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, default: null },
  phone: { 
    type: String, 
    default: null, 
    unique: true, 
    sparse: true // Cho phép nhiều tài khoản có phone là null
  },
  avatar: { type: String, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { versionKey: false });

module.exports = mongoose.model("users", userSchema);