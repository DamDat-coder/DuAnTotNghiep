"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import Container from "@/components/Core/Container";

export default function PaymentFail() {
  useEffect(() => {
    const paymentId = localStorage.getItem("pendingPaymentId"); // Lấy paymentId từ localStorage

    toast.error(
      `Đặt hàng thất bại cho giao dịch ${paymentId || "không xác định"}.`
    );
    // Xóa thông tin pending từ localStorage
    localStorage.removeItem("pendingPaymentId");
    localStorage.removeItem("pendingUserId");

    // Chuyển hướng về giỏ hàng sau 3 giây
    const timer = setTimeout(() => {
      window.location.href = "/cart"
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center"></div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Đặt hàng thất bại</h1>
        <p>Bạn sẽ được chuyển hướng về giỏ hàng trong giây lát...</p>
      </div>
    </Container>
  );
}
