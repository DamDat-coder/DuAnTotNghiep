"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { createOrder } from "@/services/orderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useCartDispatch } from "@/contexts/CartContext";
import Container from "@/components/Core/Container";
import Link from "next/link";

export default function PaymentSuccessClient() {
  const { user } = useAuth();
  const dispatch = useCartDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const paymentId = localStorage.getItem("pendingPaymentId");
    const userId = localStorage.getItem("pendingUserId");
    const paymentMethod = localStorage.getItem("paymentMethod");

    // Nếu là COD, không cần tạo đơn hàng lại
    if (paymentMethod === "cod") {
      localStorage.removeItem("pendingPaymentId");
      localStorage.removeItem("pendingUserId");
      localStorage.removeItem("paymentMethod");
      dispatch({ type: "clear" });
      toast.success("Đơn hàng COD đã được xác nhận!");
      const timer = setTimeout(() => {
        window.location.href = "/profile?tab=order";
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Xử lý cho thanh toán trực tuyến
    const createOrderAfterPayment = async (retries = 2) => {
      if (
        !paymentId ||
        typeof paymentId !== "string" ||
        paymentId.trim() === ""
      ) {
        console.error("paymentId không hợp lệ:", paymentId);
        toast.error("Không tìm thấy paymentId hợp lệ.");
        window.location.href = "/cart";
        return;
      }

      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        console.error("userId không hợp lệ:", userId);
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      try {
        const orderInfo = JSON.parse(localStorage.getItem("orderInfo") || "{}");
        const { items, shippingAddress, totalPrice, discountAmount, shipping, email, couponCode } = orderInfo;

        if (!items || !shippingAddress || !totalPrice) {
          throw new Error("Thiếu thông tin đơn hàng trong localStorage.");
        }

        const orderResponse = await createOrder(
          userId,
          items,
          shippingAddress,
          totalPrice,
          discountAmount || 0,
          paymentMethod || "vnpay",
          shipping || 0,
          email,
          couponCode
        );
        localStorage.removeItem("pendingPaymentId");
        localStorage.removeItem("pendingUserId");
        // localStorage.removeItem("paymentMethod");
        // localStorage.removeItem("orderInfo");
        dispatch({ type: "clear" });

        toast.success("Đơn hàng đã được xác nhận!");
        const timer = setTimeout(() => {
          window.location.href = "/profile?tab=order";
        }, 3000);
        return () => clearTimeout(timer);
      } catch (error: any) {
        console.error("Lỗi khi tạo đơn hàng:", JSON.stringify(error, null, 2));
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return createOrderAfterPayment(retries - 1);
        }
        toast.error(error.message || "Không thể tạo đơn hàng!");
        // window.location.href = "/cart";
      }
    };

    if (paymentId && userId) {
      createOrderAfterPayment();
    } else {
      console.error("Thiếu paymentId hoặc userId:", { paymentId, userId });
      toast.error("Dữ liệu không hợp lệ.");
      window.location.href = "/cart";
    }
  }, [user, dispatch]);

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Đặt hàng thành công
        </h1>
        <p>Bạn sẽ được chuyển hướng trong giây lát...</p>
        <Link
          href="/profile?tab=order"
          className="text-lg font-medium hover:underline text-blue-600"
        >
          Chuyển hướng ngay
        </Link>
      </div>
    </Container>
  );
}