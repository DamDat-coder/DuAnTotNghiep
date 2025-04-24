const orders = require("../models/orderModel");
const products = require("../models/productModel");
const mongoose = require("mongoose"); 

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const {
      products: orderProducts,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      subtotal,
      discount,
      shippingFee,
      total,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!orderProducts || !Array.isArray(orderProducts) || orderProducts.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ giao hàng" });
    }
    if (!paymentMethod || !["cod", "vnpay", "momo", "zalopay"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }
    if (!shippingMethod || !["standard", "express"].includes(shippingMethod)) {
      return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ" });
    }
    if (typeof subtotal !== "number" || subtotal < 0) {
      return res.status(400).json({ message: "Giá trị tạm tính không hợp lệ" });
    }
    if (typeof discount !== "number" || discount < 0) {
      return res.status(400).json({ message: "Giá trị giảm giá không hợp lệ" });
    }
    if (typeof shippingFee !== "number" || shippingFee < 0) {
      return res.status(400).json({ message: "Phí vận chuyển không hợp lệ" });
    }
    if (typeof total !== "number" || total < 0) {
      return res.status(400).json({ message: "Tổng tiền không hợp lệ" });
    }

    // Kiểm tra sản phẩm và tính toán tổng giá (để xác minh)
    let calculatedSubtotal = 0;
    for (const item of orderProducts) {
      const product = await products.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại` });
      }
      if (item.quantity < 1) {
        return res.status(400).json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
      }
      calculatedSubtotal += product.price * (1 - product.discountPercent / 100) * item.quantity;
    }

    // Xác minh subtotal từ frontend
    if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
      return res.status(400).json({ message: "Giá trị tạm tính không khớp với dữ liệu sản phẩm" });
    }

    // Xác minh total
    const calculatedTotal = subtotal - discount + shippingFee;
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({ message: "Tổng tiền không khớp với các giá trị cung cấp" });
    }

    // Tạo đơn hàng mới
    const newOrder = new orders({
      userId: req.userId,
      products: orderProducts,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      subtotal,
      discount,
      shippingFee,
      totalPrice: total, // Sử dụng total từ req.body
      status: "pending",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Mua hàng thành công",
      data: savedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await orders
      .findById(req.params.id)
      .populate("userId", "name email")
      .populate("products.productId", "name price image");
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách đơn hàng của người dùng
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const total = await orders.countDocuments({ userId: req.userId });
    const userOrders = await orders
      .find({ userId: req.userId }, null, options)
      .populate("products.productId", "name price image");

    if (!userOrders.length) {
      return res.status(404).json({ message: "Bạn chưa có đơn hàng nào" });
    }

    res.json({
      data: userOrders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (cho admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const total = await orders.countDocuments(query);
    const allOrders = await orders
      .find(query, null, options)
      .populate("userId", "name email")
      .populate("products.productId", "name price image");

    res.json({
      data: allOrders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra định dạng ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    // Kiểm tra trạng thái hợp lệ
    if (!status) {
      return res.status(400).json({ message: "Trạng thái là bắt buộc" });
    }
    if (!["pending", "success", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Cập nhật đơn hàng
    const order = await orders.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Populate dữ liệu (tùy chọn)
    await order.populate("userId", "name email").catch((err) => {
      console.error("Error populating userId:", err);
    });
    await order.populate("products.productId", "name price image").catch((err) => {
      console.error("Error populating productId:", err);
    });

    res.json({ message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    console.error(`Error updating order ${req.params.id} with status ${req.body.status}:`, error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};
module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};