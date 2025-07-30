export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  ward: string;
  district: string;
  province: string;
  phone: string;
  is_default?: boolean;
}

export interface IOrder {
  _id: string;
  userId: string;
  couponId?: string | null;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  shipping: number;
  status:
    | "pending"
    | "confirmed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "fake";
  paymentMethod: "cod" | "vnpay" | "momo" | "zalopay";
  paymentId?: string | null;
  items: OrderItem[];
  note?: string;
  orderCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderDetail {
  _id: string;
  userId: string;
  couponId?: string | null;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  shipping: number;
  status:
    | "pending"
    | "confirmed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "fake";
  paymentMethod: "cod" | "vnpay" | "momo" | "zalopay";
  paymentId?: string | null;
  items: OrderItem[];
  note?: string;
  orderCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}
