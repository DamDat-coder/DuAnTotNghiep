export interface OrderItem {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface IOrder {
  _id?: { $oid: string } | string;
  id?: string;
  user?: { name: string; email: string };
  userId?: string | { name: string; email: string; _id?: string };
  totalPrice: number;
  items: OrderItem[];
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt?: string;
  [key: string]: any;
}

export interface OrderDetail {
  id: string;
  orderCode: string;
  purchaseDate: string;
  customerEmail: string;
  products: { name: string; quantity: number }[];
  total: number;
  status: "pending" | "success" | "cancelled";
}
