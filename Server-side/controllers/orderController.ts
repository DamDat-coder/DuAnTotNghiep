import { Request, Response } from 'express';
import Order, { IOrder } from '../models/orderModel';
import Product from '../models/productModel';
import axios from 'axios';
import crypto from 'crypto';
import { Types } from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

// Hàm kiểm tra dữ liệu đầu vào
export const validateOrderInput = (
  products?: { productId: Types.ObjectId; quantity: number }[],
  shippingAddress?: string,
  paymentMethod?: string
): string | null => {
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

// Hàm tạo URL thanh toán VNPay
const createVNPayUrl = (orderId: string, amount: number, ipAddr: string): string => {
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

  let vnpParams: any = {
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
    .reduce((obj: any, key) => {
      obj[key] = vnpParams[key];
      return obj;
    }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;

  return `${vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;
};

// Hàm tạo URL thanh toán MoMo
const createMoMoUrl = async (orderId: string, amount: number): Promise<string> => {
  const partnerCode = process.env.MOMO_PARTNER_CODE || 'YOUR_PARTNER_CODE';
  const accessKey = process.env.MOMO_ACCESS_KEY || 'YOUR_ACCESS_KEY';
  const secretKey = process.env.MOMO_SECRET_KEY || 'YOUR_SECRET_KEY';
  const requestId = orderId + '-' + new Date().getTime();
  const orderInfo = `Thanh toán đơn hàng ${orderId}`;
  const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://your-domain.com/api/payment/momo/return';
  const ipnUrl = process.env.MOMO_IPN_URL || 'http://your-domain.com/api/payment/momo/ipn';
  const requestType = 'captureWallet';

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

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

  const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
  return response.data.payUrl;
};

// Hàm tạo URL thanh toán ZaloPay
const createZaloPayUrl = async (orderId: string, amount: number): Promise<string> => {
  const appId = process.env.ZALOPAY_APP_ID || 'YOUR_APP_ID';
  const key1 = process.env.ZALOPAY_KEY1 || 'YOUR_KEY1';
  const callbackUrl = process.env.ZALOPAY_CALLBACK_URL || 'http://your-domain.com/api/payment/zalopay/callback';

  const params: any = {
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
  params.mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

  const response = await axios.post('https://sb-openapi.zalopay.vn/v2/create', params);
  return response.data.order_url;
};

// Tạo đơn hàng
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { products: orderProducts, shippingAddress, paymentMethod }: Partial<IOrder> = req.body;

    // Kiểm tra dữ liệu đầu vào
    const validationError = validateOrderInput(orderProducts, shippingAddress, paymentMethod);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    // Tính tổng giá và kiểm tra sản phẩm
    let totalPrice = 0;
    for (const item of orderProducts!) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại` });
        return;
      }
      totalPrice += product.price * (1 - (product.discountPercent || 0) / 100) * item.quantity;
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId: req.user!._id,
      products: orderProducts,
      totalPrice,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Lưu đơn hàng để đảm bảo _id được tạo
    const savedOrder = await newOrder.save();

    // Xử lý thanh toán
    let paymentUrl: string | undefined;
    if (paymentMethod === 'cod') {
      savedOrder.paymentStatus = 'pending';
    } else if (paymentMethod === 'vnpay') {
      paymentUrl = createVNPayUrl((savedOrder._id as Types.ObjectId).toString(), totalPrice, req.ip || '0.0.0.0');
      savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
    } else if (paymentMethod === 'momo') {
      paymentUrl = await createMoMoUrl((savedOrder._id as Types.ObjectId).toString(), totalPrice);
      savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
    } else if (paymentMethod === 'zalopay') {
      paymentUrl = await createZaloPayUrl((savedOrder._id as Types.ObjectId).toString(), totalPrice);
      savedOrder.paymentDetails = { paymentUrl, timestamp: new Date() };
    }

    // Cập nhật thông tin thanh toán nếu có
    if (paymentUrl) {
      await savedOrder.save();
    }

    res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      data: savedOrder,
      paymentUrl, // Trả về URL thanh toán nếu có
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Callback từ VNPay
export const vnpayReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const vnpParams = req.query;
    const secureHash = vnpParams.vnp_SecureHash as string;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = vnpParams[key];
        return obj;
      }, {});

    const signData = new URLSearchParams(sortedParams).toString();
    const secretKey = process.env.VNPAY_SECRET_KEY || 'YOUR_SECRET_KEY';
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const order = await Order.findById(vnpParams.vnp_TxnRef);
    if (!order) {
      res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      return;
    }

    if (secureHash === signed) {
      if (vnpParams.vnp_ResponseCode === '00') {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        order.paymentDetails!.transactionId = vnpParams.vnp_TransactionNo as string;
        await order.save();
        res.redirect('http://your-frontend.com/payment/success');
      } else {
        order.paymentStatus = 'failed';
        await order.save();
        res.redirect('http://your-frontend.com/payment/failed');
      }
    } else {
      res.status(400).json({ message: 'Chữ ký không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Callback từ MoMo
export const momoReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, resultCode, transId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      return;
    }

    if (resultCode === 0) {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.paymentDetails!.transactionId = transId;
      await order.save();
      res.redirect('http://your-frontend.com/payment/success');
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.redirect('http://your-frontend.com/payment/failed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Callback từ ZaloPay
export const zalopayCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, mac } = req.body;
    const key2 = process.env.ZALOPAY_KEY2 || 'YOUR_KEY2';
    const computedMac = crypto.createHmac('sha256', key2).update(data).digest('hex');

    if (mac !== computedMac) {
      res.status(400).json({ message: 'Chữ ký không hợp lệ' });
      return;
    }

    const { app_trans_id } = JSON.parse(data);
    const orderId = app_trans_id.split('_')[1];
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      return;
    }

    const result = JSON.parse(data);
    if (result.return_code === 1) {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.paymentDetails!.transactionId = result.zp_trans_id;
      await order.save();
      res.json({ return_code: 1, return_message: 'Success' });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.json({ return_code: -1, return_message: 'Failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name price image');

    if (!order) {
      res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', paymentMethod } = req.query;
    const options = {
      limit: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    };

    const query: any = { userId: req.user!._id };
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const total = await Order.countDocuments(query);
    const userOrders = await Order.find(query, null, options)
      .populate('products.productId', 'name price image');

    if (!userOrders.length) {
      res.status(404).json({ message: 'Bạn chưa có đơn hàng nào' });
      return;
    }

    res.json({
      data: userOrders,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};