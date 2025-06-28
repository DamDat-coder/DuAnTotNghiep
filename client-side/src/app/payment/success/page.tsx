"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { createOrder } from "@/services/orderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useCartDispatch } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useCartDispatch(); // Di chuyển useCartDispatch ra cấp cao nhất

  useEffect(() => {
    const paymentId = localStorage.getItem("pendingPaymentId"); // Lấy paymentId từ localStorage
    const userId = localStorage.getItem("pendingUserId");

    const createOrderAfterPayment = async () => {
      if (!paymentId) {
        toast.error("Không tìm thấy paymentId.");
        router.push("/cart");
        return;
      }

      if (!user || !user.id || user.id !== userId) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      try {
        // Gọi API createOrder với paymentId (7 ký tự) và userId
        const orderResponse = await createOrder(paymentId, user.id);
        console.log("Order created:", orderResponse); // Debug

        // Xóa thông tin pending từ localStorage
        localStorage.removeItem("pendingPaymentId");
        localStorage.removeItem("pendingUserId");

        // Xóa giỏ hàng
        dispatch({ type: "clear" });

        toast.success("Đơn hàng đã được xác nhận!");
        router.push("/profile?tab=orders");
      } catch (error: any) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        toast.error(error.message || "Không thể tạo đơn hàng!");
        router.push("/cart");
      }
    };

    createOrderAfterPayment();
  }, [user, router, dispatch]); // Thêm dispatch vào dependency array

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Đang xử lý thanh toán...</h1>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  );
}