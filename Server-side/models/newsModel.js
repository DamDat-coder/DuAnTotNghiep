const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "categories", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model("news", newsSchema);