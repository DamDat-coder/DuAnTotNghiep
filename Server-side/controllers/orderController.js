const orders = require("../models/orderModel");
const products = require("../models/productModel");

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { products: orderProducts, shippingAddress } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!orderProducts || !Array.isArray(orderProducts) || orderProducts.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ giao hàng" });
    }

    // Tính tổng giá và kiểm tra sản phẩm
    let totalPrice = 0;
    for (const item of orderProducts) {
      const product = await products.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại` });
      }
      if (item.quantity < 1) {
        return res.status(400).json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
      }
      totalPrice += product.price * (1 - product.discountPercent / 100) * item.quantity;
    }

    // Tạo đơn hàng mới
    const newOrder = new orders({
      userId: req.user._id, // Giả sử verifyToken thêm thông tin user vào req
      products: orderProducts,
      totalPrice,
      shippingAddress,
      status: "success", // Giả sử mua hàng thành công ngay lập tức
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
    // Kiểm tra quyền truy cập
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
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

    const total = await orders.countDocuments({ userId: req.user._id });
    const userOrders = await orders
      .find({ userId: req.user._id }, null, options)
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

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
};