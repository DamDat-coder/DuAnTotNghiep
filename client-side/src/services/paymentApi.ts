import { IOrder } from "@/types/order";

export const createVNPayPayment = async (
  orderId: string,
  totalPrice: number,
  userId: string,
  orderInfo: string,
  accessToken: string
) => {
  try {
    const response = await fetch("http://localhost:3000/api/payment/create-vnpay-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId,
        totalPrice,
        userId,
        orderInfo,
      }),
      credentials: "include", // Gửi cookie nếu cần
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể tạo URL thanh toán VNPay");
    }

    const data = await response.json();
    return data; // { paymentUrl, paymentId }
  } catch (error: any) {
    console.error("Lỗi khi gọi API VNPay:", error);
    throw error;
  }
};