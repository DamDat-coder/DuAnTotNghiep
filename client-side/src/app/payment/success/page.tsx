"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { createOrder } from "@/services/orderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useCartDispatch } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Container from "@/components/Core/Container";

export default function PaymentSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useCartDispatch();
  const hasRun = useRef(false); // Ngăn useEffect chạy lại

  useEffect(() => {
    if (hasRun.current) return; // Ngăn chạy lại
    hasRun.current = true;

    const paymentId = localStorage.getItem("pendingPaymentId");
    const userId = localStorage.getItem("pendingUserId");

    const createOrderAfterPayment = async (retries = 2) => {
      // Kiểm tra paymentId có hợp lệ không
      if (!paymentId || typeof paymentId !== "string" || paymentId.trim() === "") {
        console.error("paymentId không hợp lệ:", paymentId);
        toast.error("Không tìm thấy paymentId hợp lệ.");
        router.push("/cart");
        return;
      }

      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        console.error("userId không hợp lệ:", userId);
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }


      try {
        const orderResponse = await createOrder(paymentId, userId);

        localStorage.removeItem("pendingPaymentId");
        localStorage.removeItem("pendingUserId");
        dispatch({ type: "clear" });

        toast.success("Đơn hàng đã được xác nhận!");
        const timer = setTimeout(() => {
          router.push("/profile?tab=order");
        }, 3000);
        return () => clearTimeout(timer);
      } catch (error: any) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ 1 giây trước khi thử lại
          return createOrderAfterPayment(retries - 1);
        }
        toast.error(error.message || "Không thể tạo đơn hàng!");
        router.push("/cart");
      }
    };

    // Chỉ gọi hàm nếu paymentId và userId hợp lệ
    if (paymentId && userId) {
      createOrderAfterPayment();
    } else {
      console.error("Thiếu paymentId hoặc userId:", { paymentId, userId });
      toast.error("Dữ liệu không hợp lệ.");
      router.push("/cart");
    }
  }, [user, router, dispatch]);

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Đặt hàng thành công
        </h1>
        <p>Bạn sẽ được chuyển hướng trong giây lát...</p>
      </div>
    </Container>
  );
}
