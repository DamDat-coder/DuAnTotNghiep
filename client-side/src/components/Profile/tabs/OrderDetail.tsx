"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { OrderDetail } from "@/types/order";
import { fetchUser } from "@/services/userApi";
import { IProduct } from "@/types/product";
import { fetchProductById } from "@/services/productApi";
import { Star } from "lucide-react";
import ReviewPopup from "../modals/ReviewPopup";
import { createReview } from "@/services/reviewApi";
import toast, { Toast } from "react-hot-toast"; // hoặc react-toastify nếu bạn dùng

interface OrderDetailProps {
  order: OrderDetail;
  setActiveTab?: (tab: string) => void;
}

export default function OrderDetail({ order, setActiveTab }: OrderDetailProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<
    (IProduct & { _id: string; quantity: number; image: string; price: number })[]
  >([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedReviews] = useState([
    "Sản phẩm tuyệt vời, chất lượng tốt.",
    "Sản phẩm như mô tả, rất hài lòng.",
    "Giá cả hợp lý, sẽ mua lại.",
    "Chất lượng sản phẩm rất tốt, giao hàng nhanh.",
  ]); // Các gợi ý cho người dùng khi không biết viết gì

  // Lấy thông tin người dùng
  useEffect(() => {
    async function fetchUserData() {
      try {
        const fetchedUser = await fetchUser();
        setUser(fetchedUser);
      } catch (error) {
        // Xử lý lỗi im lặng
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // Lấy thông tin sản phẩm từ đơn hàng
  useEffect(() => {
    async function fetchOrderProducts() {
      try {
        const fetchedProducts = await Promise.all(
          order.items.map(async (item) => {
            const product = await fetchProductById(item.productId);
            return product
              ? {
                  ...product,
                  _id: item.productId,
                  quantity: item.quantity,
                  image: item.image ?? (product.images?.[0] ?? ""), // always a string
                  price: item.price,
                }
              : null;
          })
        );
        setProducts(
          fetchedProducts.filter((p): p is IProduct & { _id: string; quantity: number; image: string; price: number } => p !== null)
        );
      } catch (error) {
        // Xử lý lỗi
      }
    }

    if (order.items.length > 0) {
      fetchOrderProducts();
    }
  }, [order.items]);

  // Hàm lấy phương thức thanh toán
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

  // Hàm lấy trạng thái đơn hàng
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

  // Tính tổng giá trị sản phẩm trong đơn hàng
  const calculateSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Nếu đang tải hoặc không tìm thấy người dùng
  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Đang tải đơn hàng...
      </div>
    );
  }

  // Hàm mở popup đánh giá cho từng sản phẩm
  const handleOpenReview = (productId: string) => {
    setReviewProductId(productId);
    setIsPopupOpen(true);
    setReviewImages([]); // reset ảnh khi mở popup mới
  };

  // Hàm xử lý gửi đánh giá
  const handleSubmitReview = async (
    review: string,
    rating: number,
    images: File[]
  ) => {
    if (!reviewProductId) return;
    setIsSubmitting(true);
    try {
      const res = await createReview(reviewProductId, review, rating, images);
      if (res.success) {
        toast.success(res.message);
        if (res.warning) toast(res.warning, { icon: "⚠️" });
      } else {
        toast.error(res.message || "Không thể gửi đánh giá.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
      setIsPopupOpen(false);
      setReviewProductId(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Không thể tìm thấy thông tin người dùng!
      </div>
    );
  }

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

      {/* Chỉ hiển thị phần đánh giá khi đơn hàng đã được giao (status === 'delivered') */}

      {/* Danh sách sản phẩm */}
      <div className="space-y-6">
        {products.map((product, index) => (
          <div key={index} className="flex items-center gap-8 w-full">
            <div className="w-[94px] h-[94px] relative">
              <Image
                src={product.images[0]}
                alt={product.name || "Sản phẩm"}
                fill
                className="object-cover rounded"
                sizes="94px"
              />
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                <p className="font-semibold">
                  {product.name || "Sản phẩm không tên"}
                </p>
                <p className="text-sm text-gray-600">
                  Màu:{" "}
                  {Array.isArray(product.variants)
                    ? (product.variants[0] as { color?: string })?.color ||
                      "Chưa xác định"
                    : (product.variants as { color?: string } | undefined)
                        ?.color || "Chưa xác định"}
                  , Kích thước:{" "}
                  {Array.isArray(product.variants)
                    ? (product.variants[0] as { size?: string })?.size ||
                      "Chưa xác định"
                    : (product.variants as { size?: string } | undefined)
                        ?.size || "Chưa xác định"}
                </p>
                <p className="text-sm text-gray-600">SL: {product.quantity}</p>
              </div>
              <div className="text-[#FF0000] font-semibold text-sm whitespace-nowrap flex flex-col justify-between h-full">
                <div className="mb-auto">
                  {(product.price * product.quantity).toLocaleString("vi-VN")}₫
                </div>
                {order.status === "delivered" && (
                  <div>
                    <button
                      onClick={() => handleOpenReview(product._id)}
                      className="px-4 py-2 bg-black text-white rounded-md mt-2"
                    >
                      Đánh giá
                    </button>
                  </div>
                )}
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
              <strong>Tên người nhận:</strong> {user.name || "Chưa cập nhật"}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {user.phone || "Chưa cập nhật"}
            </p>
            <p>
              <strong>Địa chỉ nhận hàng:</strong>{" "}
              {order.shippingAddress?.street || ""},{" "}
              {order.shippingAddress?.ward || ""},{" "}
              {order.shippingAddress?.district || ""},{" "}
              {order.shippingAddress?.province || ""}
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

      <ReviewPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setReviewProductId(null);
        }}
        onSubmit={handleSubmitReview}
        suggestedReviews={suggestedReviews}
      />
    </div>
  );
}
