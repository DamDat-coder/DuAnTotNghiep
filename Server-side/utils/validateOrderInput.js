"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrderInput = void 0;
// Hàm validate dữ liệu đầu vào của đơn hàng
const validateOrderInput = (products, shippingAddress) => {
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
exports.validateOrderInput = validateOrderInput;
