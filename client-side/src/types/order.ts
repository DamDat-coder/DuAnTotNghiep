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
  id: string;
  user: { name: string; email: string };
  total: number;
  products: { productId: { name: string; price: number; image: string[] }; quantity: number }[];
  status: "pending" | "success" | "cancelled";
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
