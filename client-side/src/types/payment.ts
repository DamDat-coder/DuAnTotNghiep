export interface PaymentInfo {
  orderId: string;
  totalPrice: number;
  userId: string;
  orderInfo: {
    address_id: string;
    shippingAddress: { street: string; ward: string; district: string; province: string };
    couponId?: string;
    items: { productId: string; quantity: number; color: string; size: string }[];
    paymentMethod: string;
  };
}