export interface PaymentInfo {
  orderId: string;
  totalPrice: number;
  userId: string;
  email: string;
  orderInfo: {
    shippingAddress: { street: string; ward: string; province: string };
    couponId?: string;
    items: {
      productId: string;
      quantity: number;
      color: string;
      size: string;
    }[];
    paymentMethod: string;
  };
}