"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Core/Container";
import { API_BASE_URL, fetchWithAuth } from "@/services/api";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
interface Order {
  _id: string;
  products: { productId: { _id: string; name: string; price: number; image: string[] }; quantity: number }[];
  totalPrice: number;
  shippingAddress: string;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetchWithAuth<{ data: Order[] }>(`${API_BASE_URL}/order/user/orders`, {
          cache: "no-store",
        });
        setOrders(response.data); 
      } catch (error) {
        toast.error("Không thể tải danh sách đơn hàng!");
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <Container>
        <p className="text-center text-gray-500 mt-4">Đang tải...</p>
      </Container>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <Toaster position="top-right" />
        <h1 className="text-2xl font-medium text-left">Đơn hàng của bạn</h1>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-md">
                {/* Dòng tóm tắt đơn hàng */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  <div className="flex flex-col desktop:flex-row desktop:items-center desktop:gap-4">
                    <span className="font-bold text-sm desktop:text-base">
                      Mã đơn hàng: {order._id}
                    </span>
                    <span
                      className={`text-sm desktop:text-base ${
                        order.status === "success" ? "text-green-500" : "text-yellow-500"
                      }`}
                    >
                      Trạng thái: {order.status === "success" ? "Thành công" : "Đang xử lý"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm desktop:text-base text-red-500">
                      {order.totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                    {expandedOrder === order._id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Chi tiết đơn hàng với hiệu ứng trượt */}
                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t flex flex-col gap-4">
                        <div className="space-y-2">
                          {order.products.map((item) => (
                            <div key={item.productId._id} className="flex items-center gap-4">
                              <Image
                                src={`/product/img/${item.productId.image[0]}`}
                                alt={item.productId.name}
                                width={90}
                                height={90}
                                className="object-cover rounded"
                              />
                              <div>
                                <p className="text-sm desktop:text-base">{item.productId.name}</p>
                                <p className="text-sm desktop:text-base">Số lượng: {item.quantity}</p>
                                <p className="text-red-500 text-sm desktop:text-base">
                                  {(item.productId.price * item.quantity).toLocaleString("vi-VN")}₫
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-sm desktop:text-base font-semibold">
                          Địa chỉ giao hàng: {order.shippingAddress}
                        </p>
                        <p className="mt-2 text-sm desktop:text-base text-gray-500">
                          Ngày tạo: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}