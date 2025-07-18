"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { createOrder } from "@/services/orderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useCartDispatch } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Container from "@/components/Core/Container";

export default function PaymentSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useCartDispatch(); // Di chuyển useCartDispatch ra cấp cao nhất

  useEffect(() => {
    const paymentId = localStorage.getItem("pendingPaymentId");
    const userId = localStorage.getItem("pendingUserId");

    const createOrderAfterPayment = async () => {
      console.log("paymentId "+ paymentId + "userId " + userId);
      
      if (!paymentId) {
        toast.error("Không tìm thấy paymentId.");
        router.push("/cart");
        return;
      }

      if (!user || !user.id || user.id != userId) {
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
        const timer = setTimeout(() => {
          router.push("/profile?tab=orders");
        }, 3000);
        return () => clearTimeout(timer);
      } catch (error: any) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        toast.error(error.message || "Không thể tạo đơn hàng!");
        router.push("/cart");
      }
    };

    createOrderAfterPayment();
  }, [user, router, dispatch]); // Thêm dispatch vào dependency array

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Thanh toán thành công
        </h1>
        <p>Bạn sẽ được trong giây lát...</p>
      </div>
    </Container>
  );
}