"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Container from "@/components/Core/Container";

export default function PaymentFail() {
  const router = useRouter();

  useEffect(() => {
    const paymentId = localStorage.getItem("pendingPaymentId"); // Lấy paymentId từ localStorage

    toast.error(
      `Thanh toán thất bại cho giao dịch ${paymentId || "không xác định"}.`
    );
    // Xóa thông tin pending từ localStorage
    localStorage.removeItem("pendingPaymentId");
    localStorage.removeItem("pendingUserId");

    // Chuyển hướng về giỏ hàng sau 3 giây
    const timer = setTimeout(() => {
      router.push("/cart");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container>
      <div className="flex flex-col justify-center items-center text-center"></div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Thanh toán thất bại</h1>
        <p>Bạn sẽ được chuyển hướng về giỏ hàng trong giây lát...</p>
      </div>
    </Container>
  );
}
