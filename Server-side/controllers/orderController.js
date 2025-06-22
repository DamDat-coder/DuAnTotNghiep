"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.updateOrderStatus = exports.getOrdersByUserId = exports.getAllOrders = exports.getUserOrders = exports.getOrderById = exports.zalopayCallback = exports.momoReturn = exports.vnpayReturn = exports.validateOrderInput = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
// Hàm kiểm tra dữ liệu đầu vào
const validateOrderInput = (products, shippingAddress, paymentMethod) => {
    if (!products || !Array.isArray(products) || products.length === 0) {
        return 'Danh sách sản phẩm không hợp lệ';
    }
    for (const item of products) {
        if (!item.productId || item.quantity < 1) {
            return 'Sản phẩm hoặc số lượng không hợp lệ';
        }
    }
    if (!shippingAddress || shippingAddress.trim() === '') {
        return 'Địa chỉ giao hàng là bắt buộc';
    }
    const validPaymentMethods = ['cod', 'vnpay', 'momo', 'zalopay'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
        return 'Phương thức thanh toán không hợp lệ';
    }
    return null;
};
exports.validateOrderInput = validateOrderInput;
// Hàm tạo URL thanh toán VNPay
const createVNPayUrl = (orderId, amount, ipAddr) => {
    const tmnCode = process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE';
    const secretKey = process.env.VNPAY_SECRET_KEY || 'YOUR_SECRET_KEY';
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNPAY_RETURN_URL || 'http://your-domain.com/api/payment/vnpay/return';
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000)
        .toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14);
    let vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount * 100,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
        vnp_OrderType: 'billpayment',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };
    const sortedParams = Object.keys(vnpParams)
        .sort()
        .reduce((obj, key) => {
        obj[key] = vnpParams[key];
        return obj;
    }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto_1.default.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams.vnp_SecureHash = signed;
    return `${vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;
};
// Hàm tạo URL thanh toán MoMo
const createMoMoUrl = (orderId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'YOUR_PARTNER_CODE';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'YOUR_ACCESS_KEY';
    const secretKey = process.env.MOMO_SECRET_KEY || 'YOUR_SECRET_KEY';
    const requestId = orderId + '-' + new Date().getTime();
    const orderInfo = `Thanh toán đơn hàng ${orderId}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://your-domain.com/api/payment/momo/return';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://your-domain.com/api/payment/momo/ipn';
    const requestType = 'captureWallet';
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto_1.default.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount: amount.toString(),
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData: '',
        requestType,
        signature,
        lang: 'vi',
    };
    const response = yield axios_1.default.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
    return response.data.payUrl;
});
// Hàm tạo URL thanh toán ZaloPay
const createZaloPayUrl = (orderId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const appId = process.env.ZALOPAY_APP_ID || 'YOUR_APP_ID';
    const key1 = process.env.ZALOPAY_KEY1 || 'YOUR_KEY1';
    const callbackUrl = process.env.ZALOPAY_CALLBACK_URL || 'http://your-domain.com/api/payment/zalopay/callback';
    const params = {
        app_id: appId,
        app_user: 'user123',
        app_time: Date.now(),
        amount,
        app_trans_id: `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${orderId}`,
        embed_data: JSON.stringify({}),
        item: JSON.stringify([]),
        description: `Thanh toán đơn hàng ${orderId}`,
        bank_code: '',
        callback_url: callbackUrl,
    };
    const data = `${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`;
    params.mac = crypto_1.default.createHmac('sha256', key1).update(data).digest('hex');
    const response = yield axios_1.default.post('https://sb-openapi.zalopay.vn/v2/create', params);
    return response.data.order_url;
});
// Callback từ VNPay
const vnpayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;
        const sortedParams = Object.keys(vnpParams)
            .sort()
            .reduce((obj, key) => {
            obj[key] = vnpParams[key];
            return obj;
        }, {});
        const signData = new URLSearchParams(sortedParams).toString();
        const secretKey = process.env.VNPAY_SECRET_KEY || 'YOUR_SECRET_KEY';
        const hmac = crypto_1.default.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        const order = yield orderModel_1.default.findById(vnpParams.vnp_TxnRef);
        if (!order) {
            res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            return;
        }
        if (secureHash === signed) {
            if (vnpParams.vnp_ResponseCode === '00') {
                order.paymentStatus = 'completed';
                order.status = 'processing';
                order.paymentDetails.transactionId = vnpParams.vnp_TransactionNo;
                yield order.save();
                res.redirect('http://your-frontend.com/payment/success');
            }
            else {
                order.paymentStatus = 'pending';
                order.status = 'pending';
                yield order.save();
                res.redirect('http://your-frontend.com/payment/pending');
            }
        }
        else {
            res.status(400).json({ message: 'Chữ ký không hợp lệ' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.vnpayReturn = vnpayReturn;
// Callback từ MoMo
const momoReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, resultCode, transId } = req.body;
        const order = yield orderModel_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            return;
        }
        if (resultCode === 0) {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            order.paymentDetails.transactionId = transId;
            yield order.save();
            res.redirect('http://your-frontend.com/payment/success');
        }
        else {
            order.paymentStatus = 'pending';
            order.status = 'pending';
            yield order.save();
            res.redirect('http://your-frontend.com/payment/pending');
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.momoReturn = momoReturn;
// Callback từ ZaloPay
const zalopayCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, mac } = req.body;
        const key2 = process.env.ZALOPAY_KEY2 || 'YOUR_KEY2';
        const computedMac = crypto_1.default.createHmac('sha256', key2).update(data).digest('hex');
        if (mac !== computedMac) {
            res.status(400).json({ message: 'Chữ ký không hợp lệ' });
            return;
        }
        const { app_trans_id } = JSON.parse(data);
        const orderId = app_trans_id.split('_')[1];
        const order = yield orderModel_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            return;
        }
        const result = JSON.parse(data);
        if (result.return_code === 1) {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            order.paymentDetails.transactionId = result.zp_trans_id;
            yield order.save();
            res.json({ return_code: 1, return_message: 'Success' });
        }
        else {
            order.paymentStatus = 'failed';
            order.status = 'pending';
            yield order.save();
            res.json({ return_code: -1, return_message: 'pending' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.zalopayCallback = zalopayCallback;
// Lấy chi tiết đơn hàng theo ID
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra userId
        if (!req.userId) {
            res.status(401).json({ message: 'Người dùng chưa được xác thực' });
            return;
        }
        const order = yield orderModel_1.default.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('products.productId', 'name price image');
        if (!order) {
            res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            return;
        }
        // Kiểm tra quyền truy cập (chỉ người dùng sở hữu đơn hàng được xem)
        if (order.userId.toString() !== req.userId) {
            res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getOrderById = getOrderById;
// Lấy danh sách đơn hàng của người dùng
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra userId
        if (!req.userId) {
            res.status(401).json({ message: 'Người dùng chưa được xác thực' });
            return;
        }
        const { page = '1', limit = '10', paymentMethod } = req.query;
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
        };
        const query = { userId: req.userId };
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        const total = yield orderModel_1.default.countDocuments(query);
        const userOrders = yield orderModel_1.default.find(query, null, options)
            .populate('products.productId', 'name price image');
        res.json({
            data: userOrders,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getUserOrders = getUserOrders;
// ------- VIẾT BỔ SUNG XỬ LÝ API --------
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Chỉ cho phép admin
        // Giả sử middleware đã set userId, và role sẽ được populate ở middleware hoặc ở đây:
        // Hoặc bạn kiểm tra lại với userId => lấy role
        // (Nếu đã dùng middleware verifyAdmin thì chỉ cần gọi hàm này)
        const admin = yield Promise.resolve().then(() => __importStar(require('../models/userModel'))).then(m => m.default.findById(req.userId));
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép xem tất cả đơn hàng' });
        }
        const orders = yield orderModel_1.default.find()
            .populate('userId', 'name email')
            .populate('products.productId', 'name price image');
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getAllOrders = getAllOrders;
// viết bổ sung xử lý order: Lấy tất cả đơn theo userId bất kỳ (chỉ admin)
const getOrdersByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield Promise.resolve().then(() => __importStar(require('../models/userModel'))).then(m => m.default.findById(req.userId));
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép xem đơn hàng của người dùng bất kỳ' });
        }
        const { userId } = req.params;
        const orders = yield orderModel_1.default.find({ userId })
            .populate('userId', 'name email')
            .populate('products.productId', 'name price image');
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getOrdersByUserId = getOrdersByUserId;
// viết bổ sung xử lý order: Cập nhật trạng thái đơn hàng (chỉ admin)
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield Promise.resolve().then(() => __importStar(require('../models/userModel'))).then(m => m.default.findById(req.userId));
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được cập nhật trạng thái đơn hàng' });
        }
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['pending', 'processing', 'delivering', 'success', 'cancelled'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
        }
        const order = yield orderModel_1.default.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }
        order.status = status;
        yield order.save();
        res.json({ message: 'Cập nhật trạng thái đơn hàng thành công', data: order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Tạo đơn hàng
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { products: orderProducts, shippingAddress, paymentMethod } = req.body;
        // Kiểm tra dữ liệu đầu vào
        const validationError = (0, exports.validateOrderInput)(orderProducts, shippingAddress, paymentMethod);
        if (validationError) {
            res.status(400).json({ message: validationError });
            return;
        }
        // Kiểm tra userId
        if (!req.userId) {
            res.status(401).json({ message: 'Người dùng chưa được xác thực' });
            return;
        }
        // Tính tổng giá và kiểm tra sản phẩm
        let totalPrice = 0;
        // --- KIỂM TRA & TRỪ TỒN KHO ---
        for (const item of orderProducts) {
            const product = yield productModel_1.default.findById(item.productId);
            if (!product) {
                res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại` });
                return;
            }
            // viết bổ sung xử lý order: kiểm tra tồn kho
            if (((_b = (_a = product.stock) !== null && _a !== void 0 ? _a : product.quantity) !== null && _b !== void 0 ? _b : 0) < item.quantity) {
                res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
                return;
            }
            // tính tổng giá như cũ...
            totalPrice += product.price * (1 - (product.discountPercent || 0) / 100) * item.quantity;
        }
        // --- Trừ tồn kho (sau khi lưu order thành công) ---
        // Thêm đoạn này SAU khi await newOrder.save():
        for (const item of orderProducts) {
            const product = yield productModel_1.default.findById(item.productId);
            if (product.stock !== undefined) {
                product.stock -= item.quantity;
            }
            else if (product.quantity !== undefined) {
                product.quantity -= item.quantity;
            }
            yield product.save();
        }
        // Tạo đơn hàng mới
        const newOrder = new orderModel_1.default({
            userId: req.userId,
            products: orderProducts,
            totalPrice,
            shippingAddress,
            paymentMethod,
            status: 'pending',
            paymentStatus: 'pending',
        });
        // Lưu đơn hàng để đảm bảo _id được tạo
        const savedOrder = yield newOrder.save();
        // Xử lý thanh toán
        let paymentUrl;
        if (paymentMethod === 'cod') {
            savedOrder.paymentStatus = 'pending';
        }
        else if (paymentMethod === 'vnpay') {
            paymentUrl = createVNPayUrl(savedOrder._id.toString(), totalPrice, req.ip || '0.0.0.0');
            savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
        }
        else if (paymentMethod === 'momo') {
            paymentUrl = yield createMoMoUrl(savedOrder._id.toString(), totalPrice);
            savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
        }
        else if (paymentMethod === 'zalopay') {
            paymentUrl = yield createZaloPayUrl(savedOrder._id.toString(), totalPrice);
            savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
        }
        // Cập nhật thông tin thanh toán nếu có
        if (paymentUrl) {
            yield savedOrder.save();
        }
        res.status(201).json({
            message: 'Tạo đơn hàng thành công',
            data: savedOrder,
            paymentUrl, // Trả về URL thanh toán nếu có
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.createOrder = createOrder;
