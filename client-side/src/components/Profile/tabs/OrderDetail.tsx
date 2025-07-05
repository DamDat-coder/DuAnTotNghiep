"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { OrderDetail } from "@/types/order";
import { fetchUser } from "@/services/userApi";
import { IProduct } from "@/types/product";
import { fetchProductById } from "@/services/productApi";

interface OrderDetailProps {
  order: OrderDetail;
  setActiveTab?: (tab: string) => void;
}

export default function OrderDetail({ order, setActiveTab }: OrderDetailProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<(IProduct & { quantity: number })[]>(
    []
  );

  useEffect(() => {
    async function fetchUserData() {
      try {
        const fetchedUser = await fetchUser(); // Gọi API lấy thông tin người dùng
        setUser(fetchedUser); // Lưu trữ thông tin người dùng vào state
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchOrderProducts() {
      try {
        const fetchedProducts = await Promise.all(
          order.items.map(async (item) => {
            const product = await fetchProductById(item.productId);
            return {
              ...product,
              quantity: item.quantity,
              image: item.image, // Use image from order item
              price: item.price, // Use price from order item
            };
          })
        );
        setProducts(
          fetchedProducts.filter((p) => p !== null) as (IProduct & {
            quantity: number;
          })[]
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchOrderProducts();
  }, [order.items]);

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Không thể tìm thấy thông tin người dùng!
      </div>
    );
  }

  const getPaymentMethod = (method: OrderDetail["paymentMethod"]) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "vnpay":
        return "VNPAY";
      case "momo":
        return "MOMO";
      case "zalopay":
        return "ZALO PAY";
      default:
        return "Phương thức thanh toán chưa cập nhật";
    }
  };

  const getStatusLabel = (status: OrderDetail["status"]) => {
    switch (status) {
      case "pending":
        return "CHỜ XÁC NHẬN";
      case "confirmed":
        return "ĐANG XỬ LÝ";
      case "shipping":
        return "ĐANG GIAO";
      case "delivered":
        return "ĐÃ HOÀN THÀNH";
      case "cancelled":
        return "ĐÃ HỦY";
      default:
        return String(status).toUpperCase();
    }
  };

  const calculateSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="w-[894px] mx-auto px-4 py-6 space-y-12">
      <h1 className="text-xl font-bold border-b pb-2">ĐƠN HÀNG</h1>
      <div className="flex justify-between items-center text-sm">
        <button
          onClick={() => setActiveTab?.("Đơn hàng")}
          className="flex items-center gap-2 text-gray-600 font-medium"
        >
          <Image src="/profile/Back.svg" alt="back" width={6} height={10} />
          TRỞ LẠI
        </button>
        <div className="flex items-center gap-2 font-medium">
          <span>MÃ ĐƠN HÀNG: {order._id}</span>
          <span>|</span>
          <span>ĐƠN HÀNG {getStatusLabel(order.status)}</span>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-6">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-8 w-full">
            <div className="w-[94px] h-[94px] relative">
              <Image
                src={item.image || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-cover rounded"
                sizes="94px"
              />
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Màu: {item.color}, Kích thước: {item.size}
                </p>
                <p className="text-sm text-gray-600">SL: {item.quantity}</p>
              </div>
              <div className="text-[#FF0000] font-semibold text-sm whitespace-nowrap">
                {(item.price * item.quantity).toLocaleString("vi-VN")}₫
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Địa chỉ nhận hàng */}
      <div className="text-base mb-6">
        <h2 className="text-[20px] font-bold mb-[24px]">ĐỊA CHỈ NHẬN HÀNG</h2>
        <div className="flex justify-between items-start gap-[18px]">
          <div className="w-[679px] space-y-[12px] leading-relaxed">
            <p>
              <strong>Tên người nhận:</strong> {user.name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {user.phone}
            </p>
            <p>
              {/* <strong>Địa chỉ nhận hàng:</strong> {order.shippingAddress.street}
              , {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.province} */}
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              <span className="uppercase">
                {getPaymentMethod(order.paymentMethod)}
              </span>
            </p>
            {order.note && (
              <p>
                <strong>Ghi chú:</strong> {order.note}
              </p>
            )}
          </div>
          <div className="text-right whitespace-nowrap font-medium self-center">
            Giao Hàng Nhanh
          </div>
        </div>
      </div>

      {/* Bảng tổng kết */}
      <table className="w-full text-base text-black bg-[#F8FAFC] rounded overflow-hidden">
        <thead>
          <tr className="text-gray-500 text-[16px] h-[64px]">
            <th className="w-[223.5px] text-center align-middle">
              Tổng giá sản phẩm
            </th>
            <th className="w-[223.5px] text-center align-middle">Tiền ship</th>
            <th className="w-[223.5px] text-center align-middle">Giảm giá</th>
            <th className="w-[223.5px] text-center align-middle text-black">
              Tổng tiền
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[64px] text-[15px] font-medium">
            <td className="text-center align-middle">
              {calculateSubtotal().toLocaleString("vi-VN")}₫
            </td>
            <td className="text-center align-middle">
              {order.shipping.toLocaleString("vi-VN")}₫
            </td>
            <td className="text-center align-middle">
              {order.couponId ? "Có áp dụng" : "0"}₫
            </td>
            <td className="text-center align-middle font-semibold">
              {order.totalPrice.toLocaleString("vi-VN")}₫
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
