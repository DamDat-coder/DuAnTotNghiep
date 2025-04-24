const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "momo", "zalopay"], // Giới hạn các giá trị hợp lệ
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"], // Giới hạn các giá trị hợp lệ
      required: true,
    },
  },
  { versionKey: false }
);

const orderModel = mongoose.model("orders", orderSchema);
module.exports = orderModel;
