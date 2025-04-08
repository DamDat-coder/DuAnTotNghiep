const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, 
    discountPercent: { type: Number, default: 0, min: 0 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    image: [{ type: String }],
  },
  { versionKey: false }
);

productSchema.index({ name: 1, categoryId: 1 });
const productModel = mongoose.model("products", productSchema);
module.exports = productModel;