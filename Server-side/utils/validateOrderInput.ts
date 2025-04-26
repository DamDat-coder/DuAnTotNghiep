import { IOrder } from '../models/orderModel';

// Hàm validate dữ liệu đầu vào của đơn hàng
export const validateOrderInput = (
  products: IOrder['products'] | undefined,
  shippingAddress: IOrder['shippingAddress'] | undefined
): string | null => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return 'Danh sách sản phẩm không hợp lệ';
  }
  if (!shippingAddress) {
    return 'Vui lòng cung cấp địa chỉ giao hàng';
  }
  for (const item of products) {
    if (item.quantity < 1) {
      return 'Số lượng sản phẩm phải lớn hơn 0';
    }
  }
  return null;
};