"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import Container from "@/components/Core/Container";
import Link from "next/link";

export default function PaymentFailClient() {
  useEffect(() => {
    const paymentId = localStorage.getItem("pendingPaymentId");

    toast.error(
      `Đặt hàng thất bại cho giao dịch ${paymentId || "không xác định"}.`
    );
    // Xóa thông tin pending từ localStorage
    localStorage.removeItem("pendingPaymentId");
    localStorage.removeItem("pendingUserId");

    // Chuyển hướng về giỏ hàng sau 3 giây
    const timer = setTimeout(() => {
      window.location.href = "/cart";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-red-600">Đặt hàng thất bại</h1>
        <p>Bạn sẽ được chuyển hướng về giỏ hàng trong giây lát...</p>
        <Link
          href="/cart"
          className="text-lg font-medium hover:underline text-blue-600 mt-2"
        >
          Chuyển hướng ngay
        </Link>
      </div>
    </Container>
  );
}
